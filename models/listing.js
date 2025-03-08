module.exports = (sequelize, DataTypes) => {
    const Listing = sequelize.define('Listing', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Categories',
                key: 'id',
            },
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

    Listing.associate = (models) => {
        Listing.belongsTo(models.Category, {
            foreignKey: 'categoryId',
            as: 'category',
        })

        Listing.belongsTo(models.DirectoryType, {
            foreignKey: 'directoryTypeId',
            as: 'directoryType',
        })
    }

    return Listing
}
