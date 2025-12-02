import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users') // DB에 생성될 테이블 이름: users
export class User {
  @PrimaryGeneratedColumn()
  id: number; // 고유 ID (자동 증가)

  @Column({ unique: true })
  email: string; // 이메일 (중복 불가)

  // [추가] 비밀번호 컬럼 (DB 변경사항 반영)
  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  nickname: string; // 닉네임

  @Column({ nullable: true })
  kakaoId: string; // 카카오 로그인 ID

  @Column({ nullable: true })
  profileImage: string; // 프로필 이미지 URL

  @CreateDateColumn()
  createdAt: Date; // 생성일 자동 기록

  @UpdateDateColumn()
  updatedAt: Date; // 수정일 자동 기록
}
