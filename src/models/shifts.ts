import { DataTypes, Model, Sequelize } from 'sequelize';
import { IShiftAttributes } from '../interfaces/shifts.interface';

export default (sequelize: Sequelize) => {
    class Shifts extends Model<IShiftAttributes> implements IShiftAttributes {
        id!: number;    
        scheduleId?: number | undefined;
        startTime?: String | undefined;
        endTime?: String | undefined;   
        static associate(models: any) {
            Shifts.belongsTo(models.Schedules, { foreignKey: 'scheduleId' });
        }
    }
    Shifts.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        scheduleId: {
            type: DataTypes.INTEGER,
            field: 'schedule_id'
        },
        day: {
            type: DataTypes.STRING,
            field: 'day'
        },
        startTime: {
            type: DataTypes.STRING,
            field: 'start_time'
        },
        endTime: {
            type: DataTypes.STRING,
            field: 'end_time'
        }
    }, {
        sequelize,
        modelName: 'shifts',
    });
    return Shifts;
}