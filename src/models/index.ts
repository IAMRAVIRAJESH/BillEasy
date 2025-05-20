import sequelize from '../config/database'
import User from './user'
import File from './file'

export const syncModels = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true })
    console.log('Database models synchronized successfully')
  } catch (error) {
    console.error('Error synchronizing database models:', error)
    process.exit(1)
  }
}

export { User, File }
