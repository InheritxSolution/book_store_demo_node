import { BaseEntity } from 'src/common/entity/base.entity';
import { recordStatus } from 'src/common/enums/crud.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    default: '',
  })
  bookName: string;

  @Column({
    nullable: false,
    default: '',
  })
  isbn: string;

  @Column({
    nullable: false,
    default: recordStatus.CREATED,
    enum: recordStatus,
  })
  status: number;
}
