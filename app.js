import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';
import characterRoutes from './routes/characterRoutes.js';
import cors from 'cors';
import authMiddleware from './middlewares/authMiddleware.js';
import itemRouter from './routes/itemRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 로그인 및 회원가입에는 인증 필요 없음('/auth' 경로는 인증 미들웨어를 사용하지 않음)
app.use('/auth', authRoutes); 

// 캐릭터 관련 API와 보호된 API는 인증 필요
app.use('/api', authMiddleware, characterRoutes);
app.use('/api', authMiddleware, protectedRoutes);
app.use('/api', itemRouter);
app.get('/public-route', (req, res) => {
    res.send('This is a public route');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
