import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// 아이템 생성 API
router.post('/items', async (req, res) => {
    const { itemCode, name, description, itemStats, price } = req.body;

    // 필수 필드 확인
    const missingFields = [];
    if (!itemCode) missingFields.push('itemCode');
    if (!name) missingFields.push('name');
    if (!description) missingFields.push('description');
    if (!itemStats) missingFields.push('itemStats');
    if (price === undefined) missingFields.push('price');

    if (missingFields.length > 0) {
        return res.status(400).json({ message: `다음 필드가 누락되었습니다: ${missingFields.join(', ')}` });
    }

    // itemStats가 JSON 포맷인지 확인
    if (typeof itemStats !== 'object') {
        return res.status(400).json({ message: 'itemStats는 JSON 형식이어야 합니다.' });
    }

    try {
        const newItem = await prisma.item.create({
            data: {
                itemCode,
                name,
                description,
                itemStats: JSON.stringify(itemStats), // JSON으로 저장
                price,
            },
        });

        res.status(201).json(newItem); // 생성된 아이템 반환
    } catch (error) {
        console.error('아이템 생성 오류:', error);
        res.status(500).json({ message: '서버 오류', error: error.message });
    }
});

// 아이템 수정 API
router.put('/items/:itemCode', async (req, res) => {
    const { itemCode } = req.params; // URI 파라미터에서 아이템 코드 가져오기
    const { name, description, itemStats, price } = req.body; // 요청 본문에서 데이터 가져오기

    // 필수 필드 확인
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!itemStats) missingFields.push('itemStats');
    if (price === undefined) missingFields.push('price');

    if (missingFields.length > 0) {
        return res.status(400).json({ message: `다음 필드가 누락되었습니다: ${missingFields.join(', ')}` });
    }

    // itemStats가 JSON 포맷인지 확인
    if (typeof itemStats !== 'object') {
        return res.status(400).json({ message: 'itemStats는 JSON 형식이어야 합니다.' });
    }

    try {
        const updatedItem = await prisma.item.update({
            where: { itemCode },
            data: {
                name,
                description,
                itemStats: JSON.stringify(itemStats),
                price,
            },
        });

        res.status(200).json(updatedItem); // 수정된 아이템 반환
    } catch (error) {
        console.error('아이템 수정 오류:', error);
        res.status(500).json({ message: '서버 오류', error: error.message });
    }
});

// 아이템 상세 조회 API
router.get('/items/:itemCode', async (req, res) => {
    const { itemCode } = req.params; // URI 파라미터에서 아이템 코드 가져오기

    try {
        const item = await prisma.item.findUnique({
            where: { itemCode },
            select: {
                itemCode: true,
                name: true,
                itemStats: true,
                price: true,
            },
        });

        if (!item) {
            return res.status(404).json({ message: '아이템을 찾을 수 없습니다.' });
        }

        res.status(200).json(item); // 아이템 정보 반환
    } catch (error) {
        console.error('아이템 조회 오류:', error);
        res.status(500).json({ message: '서버 오류', error: error.message });
    }
});

export default router; // 라우터 내보내기
