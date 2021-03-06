import config from '../src/config';
import express, { Response, response } from 'express';
import $sql from './sqlMap';
import { GetMemberResult, ResultCommon, getProjectMemberListResult, GetMemberRoleResult } from 'achieve-it-contract';
import {
  commonDeleteHandler,
  commomInsertHandler,
  mysqlErrorHandler,
  commomUpdateHandler,
  notFoundErrorHandler
} from '../src/util';
import { conn } from '../src/mysqlPool';
const router = express.Router();

// get /member/:member_id
// getMember

router.get('/:member_id', (req, res: Response<GetMemberResult>) => {
  const member_id = req.params.member_id;
  conn.query($sql.member.getMemberById, [member_id], (err, result) => {
    if (err) {
      mysqlErrorHandler(res, err);
    } else if (result.length == 1) {
      result[0].job = config.numberMap.memberJob[result[0].job];
      res.json({
        member: result[0],
        status: config.status.SUCCESS,
        msg: config.msg.GET_MEMBER
      });
    } else {
      notFoundErrorHandler(res);
    }
  });
});

// put /member/:member_id
// updateMember
router.put('/:member_id', (req, res: Response<ResultCommon>) => {
  const member_details = req.body;
  const member_id = req.params.member_id;

  conn.query($sql.member.getMemberById, [member_id], (err, result) => {
    if (err) {
      mysqlErrorHandler(res, err);
    } else if (result.length == 1) {
      const old_member = result[0];
      conn.query(
        $sql.member.updateMemberById,
        [
          member_details.member_name || old_member.member_name,
          member_details.email || old_member.email,
          member_details.department || old_member.department,
          member_details.leader_email || old_member.leader_email,
          member_details.phone || old_member.phone,
          member_details.job || old_member.job,
          member_id
        ],
        err2 => {
          commomUpdateHandler(res, err2);
        }
      );
    } else {
      notFoundErrorHandler(res);
    }
  });
});

// post /memner
// insertMember
router.post('/', (req, res: Response<ResultCommon>) => {
  const member_details = req.body;
  conn.query(
    $sql.member.insertMember,
    [
      member_details.member_name || '',
      member_details.email || '',
      member_details.department || '',
      member_details.leader_email || '',
      member_details.phone || '',
      member_details.job || ''
    ],
    (err, result) => {
      if (err) {
        mysqlErrorHandler(res, err);
      } else {
        conn.query(
          $sql.user.insertUser,
          [member_details.username || result.insertId, member_details.password || result.insertId, result.insertId],
          err2 => {
            commomInsertHandler(res, err2);
          }
        );
      }
    }
  );
});

// delete /member/:member_id
// unfinished: 未实现级联删除
router.delete('/:member_id', (req, res: Response<ResultCommon>) => {
  const member_id = req.params.member_id;
  conn.query($sql.member.deleteMemberById, [member_id], err => {
    commonDeleteHandler(res, err);
  });
});

// get /member/getMemberRoleInProject/:projec_id
router.get('/getMemberRoleInProject/:project_id', (req, res: Response<GetMemberRoleResult>) => {
  const projec_id = req.params.project_id;
  const member_id = req.query.member_id;
  conn.query($sql.member.getMemberRole, [projec_id, member_id], (err, result) => {
    if (err) {
      mysqlErrorHandler(res, err);
    } else if (result.length == 1) {
      res.json({
        member_role: result[0],
        status: config.status.SUCCESS,
        msg: 'get success'
      });
    } else {
      notFoundErrorHandler(res);
    }
  });
});

// get /member/getProjectMemberList/:project_id
router.get('/getProjectMemberList/:project_id', (req, res: Response<getProjectMemberListResult>) => {
  const project_id = req.params.project_id;
  conn.query($sql.member.getProjectMemberList, [project_id], (err, result) => {
    if (err) {
      mysqlErrorHandler(res, err);
    } else {
      for (let member of result) {
        const role = member.role;
        member.role = [];
        role.split(',').forEach(r => {
          member.role.push(config.numberMap.memberRoleInProject[Number(r)]);
        });
        // member.role = config
      }
      res.json({
        member_list: result,
        status: config.status.SUCCESS,
        msg: 'get success'
      });
    }
  });
});

// put /member/changeMemberRole/:project_id
router.put('/changeMemberRole/:project_id', (req, res: Response<ResultCommon>) => {
  const project_id = req.params.project_id;
  const new_data = req.body;
  conn.query($sql.member.getMemberRole, [project_id, new_data.member_id], (err, result) => {
    if (err) {
      mysqlErrorHandler(res, err);
    } else if (result.length == 1) {
      const old_role = result[0];
      conn.query(
        $sql.member.changeMemberRole,
        [new_data.role || old_role.role, new_data.authority || old_role.authority, project_id, new_data.member_id],
        err2 => {
          commomUpdateHandler(res, err2);
        }
      );
    } else {
      notFoundErrorHandler(res);
    }
  });
});
export default router;
