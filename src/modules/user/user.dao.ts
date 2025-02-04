import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './user.dto';
import {
  UserRole,
  UserRoleDocument,
} from '@/common/Schema/user-role/index.schema';

const table = 'menus';
@Injectable()
export class UsersDao {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  create(user: CreateUserDto) {
    return this.userModel.create(user);
  }

  async findAll() {
    /*  return this.userModel.find({}).populate(['user_role']); */
    // const result = await this.userModel.find({});
    const result = await this.userModel.aggregate([
      {
        $match: {
          $expr: { $eq: ['$_id', { $toObjectId: '616685b13f4cf23b21e0003b' }] },
        },
      },
      {
        $lookup: {
          from: 'user_role',
          let: { userId: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$userId', '$$userId'] },
              },
            },
          ],
          as: 'userRole',
        },
      },
      { $unwind: '$userRole' },
      {
        $project: {
          password: 0,
        },
      },
      {
        $lookup: {
          from: 'role',
          let: { roleId: { $toObjectId: '$userRole.roleId' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$roleId'] },
              },
            },
          ],
          as: 'role',
        },
      },
      { $unwind: '$role' },
      {
        $lookup: {
          from: 'role_resource',
          let: { roleId: { $toString: '$role._id' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$roleId', '$$roleId'] },
              },
            },
          ],
          as: 'roleResource',
        },
      },
      {
        $unwind: '$roleResource',
      },
      {
        $lookup: {
          from: 'resource_menu',
          let: {
            resourceIds: '$roleResource.resourceIds',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$resourceId', '$$resourceIds'],
                },
              },
            },
            {
              $lookup: {
                from: 'menus',
                let: {
                  menuId: '$menuId',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: [{ $toString: '$_id' }, '$$menuId'],
                      },
                    },
                  },
                ],
                as: 'menu',
              },
            },
            {
              $unwind: '$menu',
            },
            {
              $group: {
                _id: '$menuId',
                menu: { $first: '$menu' },
                resourceIds: { $push: '$resourceId' },
              },
            },
            {
              $lookup: {
                from: 'resource_operation',
                let: {
                  resourceIds: '$resourceIds',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$resourceId', '$$resourceIds'],
                      },
                    },
                  },
                ],
                as: 'operation',
              },
            },
            {
              $lookup: {
                from: 'operation',
                let: {
                  operation: '$operation',
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: [{ $toString: '$_id' }, '$$operation.operationId'],
                      },
                    },
                  },
                ],
                as: 'operationDetails',
              },
            },
            {
              $group: {
                _id: '$_id',
                name: { $first: '$menu.name' },
                path: { $first: '$menu.path' },
                rights: { $first: '$operationDetails.type' },
              },
            },
          ],
          as: 'resource',
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          createdAt: 1,
          updatedAt: 1,
          role: 1,
          resource: 1,
        },
      },
    ]);
    const result1 = await this.userModel.find({});
    console.log('result===', result);
    // console.log('result====userRole===', result[0]?.userRole);
    console.log('==========result=======', result[0].roleResource);
    console.log('==========result=======', result[0].resource);
    console.log('==========result=======', result[0].menus);
    // console.log('result=====roleResource==', result[0]?.resource[0]);
    // console.log('result=====roleResource==', result);

    // console.log('result=====role==', result[1]?.role);
    // console.log('result1===', result1);

    return result;
  }

  findById(id: string) {
    return this.userModel.findById(id);
  }

  findByName(username: string) {
    return this.userModel.find({ username });
  }

  update(id: string) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return this.userModel.deleteOne({ _id: id });
  }
}

const a = {
  _id: '12346789',
  username: '管理A',
  userRole: [
    {
      type: 0,
      name: '管理员',
    },
  ],
  resource: [
    {
      type: 'menu',
      list: [
        {
          url: '/user',
          btnPermissions: {
            modify: true,
            find: true,
            add: true,
            delete: true,
          },
        },
        {
          url: '/article',
          btnPermissions: {
            modify: true,
            find: true,
            add: true,
            delete: true,
          },
        },
      ],
    },
    {
      type: 'action',
      playLoad: {
        url: '/user',
      },
    },
  ],
};
