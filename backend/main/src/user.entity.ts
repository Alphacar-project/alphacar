import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity() // 이 클래스는 DB 테이블이 됩니다
export class User {
  @PrimaryGeneratedColumn() // 1, 2, 3... 자동으로 늘어나는 고유 번호
  id: number;

  @Column({ unique: true }) // 카카오 ID는 중복되면 안 되므로 unique 설정
  kakaoId: string;

  @Column()
  nickname: string;

  @Column({ nullable: true }) // 이메일은 없을 수도 있으므로 nullable 허용
  email: string;

  @Column({ default: 'kakao' })
  provider: string;
}
