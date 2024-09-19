import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middlewares/authMiddleware.js';

const prisma = new PrismaClient();
const router = express.Router();

// 루트 핸들러
router.get('/', (req, res) => {
    res.send('Auth routes available');
});

// 회원가입 API
router.post('/signup', async (req, res) => {
    console.log(req.body); // 요청 본문 로그 출력
    const { username, password, confirmPassword, name } = req.body;

     // 요청 본문 유효성 검사
     if (!username || !password || !confirmPassword || !name) {
        return res.status(400).json({ message: '모든 필드를 채워주세요.' });
    }

    // 유효성 검사
    if (!/^[a-z0-9]+$/.test(username)) {
        return res.status(400).json({ message: '아이디는 영어 소문자와 숫자만 포함되어야 합니다.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: '비밀번호는 최소 6자 이상이어야 합니다.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.' });
    }

    // 사용자 중복 체크
    const existingUser = await prisma.user.findFirst({ where: { username } });
    if (existingUser) {
        return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });
    }

    // 비밀번호 해싱
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
        console.error('Hashing error:', error);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }

    // 사용자 생성
    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
            },
        });

        // 비밀번호 제외한 사용자 정보 반환
        const { password: _, ...userInfo } = user;
        res.status(201).json(userInfo);
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 로그인 API
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 사용자 조회
    const user = await prisma.user.findFirst({ where: { username } });
    if (!user) {
        return res.status(401).json({ message: '아이디가 존재하지 않습니다.' });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: '비밀번호가 틀립니다.' });
    }

    // JWT 생성
    try {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, username: user.username, name: user.name } });
    } catch (error) {
        console.error('JWT 생성 오류:', error);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 보호된 라우트에 미들웨어 적용
router.get('/protected', (req, res) => {
    res.json({ message: '보호된 데이터에 접근했습니다.', user: req.user });
});

export default router;
