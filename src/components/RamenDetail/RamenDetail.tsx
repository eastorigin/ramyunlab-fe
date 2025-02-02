import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "./RamenDetail.scss";

interface Ramyun {
    ramyunIdx: number;
    ramyunName: string;
    ramyunImg: string;
    avgRate: number;
    brandName: string;
    ramyunKcal: number;
    noodle: boolean;
    isCup: boolean;
    cooking: boolean;
    gram: number;
    ramyunNa: number;
    scoville: number | null;
}

interface RamenDetailProps {
    image: string;
    avgRate: number;
}

const RamenDetail: React.FC<RamenDetailProps> = ({ image, avgRate }) => {
    const { ramyunIdx } = useParams<{ ramyunIdx: string }>();
    const location = useLocation();
    const [ramyun, setRamyun] = useState<Ramyun | null>(location.state?.ramyun || null);

    useEffect(() => {
        const fetchRamyun = async (id: string) => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_SERVER}/main/ramyun/${id}`
                );
                setRamyun(response.data.data.ramyun);
            } catch (error) {
                console.error("Error fetching ramyun data", error);
            }
        };

        if (!ramyun) {
            fetchRamyun(ramyunIdx);
        }
    }, [ramyunIdx, ramyun]);

    useEffect(() => {
        if (ramyun) {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            const userId = userInfo.userId;
            if (userId) {
                const viewedRamyunListKey = `viewedRamyunList_${userId}`;
                const viewedRamyunList = JSON.parse(
                    localStorage.getItem(viewedRamyunListKey) || "[]"
                );

                if (!viewedRamyunList.some((item: Ramyun) => item.ramyunIdx === ramyun.ramyunIdx)) {
                    viewedRamyunList.push(ramyun);
                }

                localStorage.setItem(viewedRamyunListKey, JSON.stringify(viewedRamyunList));
            }
        }
    }, [ramyun]);

    if (!ramyun) {
        return <div>라면 정보를 불러오지 못했습니다.</div>;
    }

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        return (
            <>
                {Array.from({ length: fullStars }).map((_, index) => (
                    <FaStar key={`full-${index}`} className="star full" />
                ))}
                {halfStar === 1 && <FaStarHalfAlt className="star half" />}
                {Array.from({ length: emptyStars }).map((_, index) => (
                    <FaRegStar key={`empty-${index}`} className="star empty" />
                ))}
            </>
        );
    };

    return (
        <div className="ramen-detail">
            <img src={image} alt={ramyun.ramyunName} className="ramen-image" />
            <p className="rating">
                {renderStars(avgRate)} {avgRate.toFixed(1)}
            </p>
        </div>
    );
};

export default RamenDetail;
