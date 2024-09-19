import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ message: '권한 부여 토큰이 필요합니다.' });

    // JWT_SECRET 확인
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        return res.status(500).json({ message: '서버 내부 에러' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
        req.user = user;
        next();
    });
};

// 보호된 라우트 예시
router.get('/protected-route', authenticateToken, async (req, res) => {
    try {
        const characters = await prisma.character.findMany({
            where: { accountId: req.user.id } // 인증된 사용자 ID로 캐릭터 조회
        });
        res.json(characters);
    } catch (error) {
        console.error('서버 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 서버 종료 시 Prisma 클라이언트 종료
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

export default router;
