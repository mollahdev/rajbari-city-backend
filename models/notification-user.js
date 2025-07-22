'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    class NotificationUser extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            NotificationUser.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            })
            NotificationUser.belongsTo(models.Notification, {
                foreignKey: 'notificationId',
                as: 'notification',
            })
        }
    }

    NotificationUser.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
            },
            notificationId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Notifications',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            read: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            archived: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'NotificationUser',
            tableName: 'NotificationUsers',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    fields: ['userId'],
                    name: 'notification_user_user_id_index',
                },
            ],
        }
    )

    return NotificationUser
}
