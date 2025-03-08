module.exports = (sequelize, DataTypes) => {
    const DirectoryType = sequelize.define('DirectoryType', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    })

    DirectoryType.associate = (models) => {
        DirectoryType.hasMany(models.Category, {
            foreignKey: 'directoryTypeId',
            as: 'categories',
            onDelete: 'CASCADE',
        })
    }

    return DirectoryType
}
