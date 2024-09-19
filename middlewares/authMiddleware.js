import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '권한 부여 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];

    // JWT_SECRET 확인
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        return res.status(500).json({ message: '서버 내부 에러' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // JWT에서 얻은 사용자 정보를 req.user에 저장
        next();
    } catch (error) {
        console.error('JWT Error:', error.message); // 오류 메시지 로그 추가
        return res.status(403).json({ message: '유효하지 않거나 만료된 토큰입니다. 다시 로그인하세요.' });
    }
};

export default authMiddleware;
