import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database'
import { FileAttributes, FileStatus } from '../types'
import User from './user'

class File extends Model<FileAttributes> implements FileAttributes {
  public id!: number
  public userId!: number
  public originalFilename!: string
  public storagePath!: string
  public title!: string
  public description!: string
  public status!: FileStatus
  public extractedData!: string
  public uploadedAt!: Date
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

File.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    originalFilename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    storagePath: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(FileStatus)),
      allowNull: false,
      defaultValue: FileStatus.UPLOADED,
    },
    extractedData: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'files',
    timestamps: true,
  },
)

File.belongsTo(User, { foreignKey: 'userId' })
User.hasMany(File, { foreignKey: 'userId' })

export default File
