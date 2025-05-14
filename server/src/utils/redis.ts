import { redisClient } from "../config/redis"

// by default it gets the entire list
export const getList = (listName: string, start: number=0, end: number=-1) => redisClient.lRange(listName, start, end);

export const pushToList = async (listName: string, item: string, limit?: number) => {
    await redisClient.rPush(listName, item)
    const listLen = await redisClient.lLen(listName)

    if(limit && listLen > limit) {
        await redisClient.lTrim(listName, -limit, -1)
    }

    const list = await getList(listName);
    return list
}