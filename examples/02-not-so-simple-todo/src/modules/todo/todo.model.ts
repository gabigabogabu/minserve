import { Column, DataType, IsUUID, Model, Table } from "sequelize-typescript";

@Table({ tableName: "todo" })
export class Todo extends Model {
  @IsUUID(4)
  @Column({ 
    primaryKey: true, 
    type: DataType.UUID, 
    defaultValue: DataType.UUIDV4
  })
  id!: string;

  @Column({ 
    type: DataType.STRING, 
    allowNull: false 
  })
  item!: string;

  @Column({ 
    type: DataType.BOOLEAN, 
    allowNull: false, 
    defaultValue: false 
  })
  done!: boolean;
}