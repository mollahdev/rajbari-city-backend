module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        directoryTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'DirectoryTypes',
                key: 'id',
            },
        },
    })

    Category.associate = (models) => {
        Category.belongsTo(models.DirectoryType, {
            foreignKey: 'directoryTypeId',
            as: 'directoryType',
        })

        Category.hasMany(models.Listing, {
            foreignKey: 'categoryId',
            as: 'listings',
            onDelete: 'CASCADE',
        })
    }

    return Category
}
