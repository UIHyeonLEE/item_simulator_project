import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'; // JWT를 사용하기 위한 라이브러리
import bcrypt from 'bcrypt'; // 비밀번호 해싱을 위한 라이브러리

const prisma = new PrismaClient();
const router = express.Router();

// 로그인 API
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const account = await prisma.account.findUnique({
        where: { username },
    });

    if (!account) {
        return res.status(404).json({ message: '아이디가 존재하지 않습니다.' });
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: '비밀번호가 틀립니다.' });
    }

    const token = jwt.sign({ id: account.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ accessToken: token });
});

// 캐릭터 생성 API
router.post('/characters', async (req, res) => {
    const { name, level } = req.body;
    const userId = req.user.id; // JWT에서 사용자 ID 추출

    try {
        const existingCharacter = await prisma.character.findFirst({
            where: { name }
        });

        if (existingCharacter) {
            return res.status(400).json({ message: '이미 존재하는 캐릭터 이름입니다.' });
        }

        const character = await prisma.character.create({
            data: {
                name,
                level,
                health: 500, // 기본 HP
                power: 100,  // 기본 힘
                money: 10000, // 기본 게임 머니
                accountId: userId,
            },
        });
        res.status(201).json(character);
    } catch (error) {
        console.error('캐릭터 생성 오류:', error.message); // 에러 메시지 출력
        res.status(500).json({ message: '서버 오류', error: error.message }); // 에러 메시지 포함
    }
});

// 캐릭터 조회 API (ID로 조회)
router.get('/characters/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // JWT에서 사용자 ID 추출

    try {
        const character = await prisma.character.findUnique({ where: { id: Number(id) } });

        if (!character) {
            return res.status(404).json({ message: '캐릭터가 존재하지 않습니다.' });
        }

        // 캐릭터 정보 반환
        const characterInfo = {
            name: character.name,
            level: character.level,
            accountId: character.accountId,
            power: character.power,   
            money: character.money,     
            health: character.health,
        };

        // 로그인한 사용자가 소유한 캐릭터일 경우, 추가 정보 제공
        if (character.accountId === userId) {
            characterInfo.money = character.money; // 게임 머니 추가
        }

        res.json(characterInfo);
    } catch (error) {
        console.error('Error fetching character details:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 캐릭터 업데이트 API
router.put('/api/characters/:id', async (req, res) => {
    const { id } = req.params;
    const { name, level, power, money, health } = req.body; // 모든 필드 포함

    try {
        const updatedCharacter = await prisma.character.update({
            where: { id: Number(id) },
            data: {
                name,
                level,
                power,    
                money,    
                health,   
            },
        });

        res.json(updatedCharacter);
    } catch (error) {
        console.error('캐릭터 업데이트 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 캐릭터 삭제 API
router.delete('/characters/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // JWT에서 사용자 ID 추출

    try {
        const character = await prisma.character.findUnique({ where: { id: Number(id) } });

        if (!character) {
            return res.status(404).json({ message: '캐릭터가 존재하지 않습니다.' });
        }

        if (character.accountId !== userId) {
            return res.status(403).json({ message: '자신의 캐릭터만 삭제할 수 있습니다.' });
        }

        await prisma.character.delete({ where: { id: Number(id) } });
        res.status(204).send(); // 삭제 성공 시, No Content
    } catch (error) {
        console.error('Error deleting character:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

export default router;
