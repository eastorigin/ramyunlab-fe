import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

interface RamenInfo {
    r_idx: number;
    r_name: string;
    r_img: string | null;
    b_name: string;
    r_kcal: number;
    r_noodle: boolean;
    r_is_cup: boolean;
    r_cooking: boolean;
    r_gram: number;
    r_na: number;
    r_scoville?: number;
    isLiked: boolean;
}

interface RamenInfoTableProps {
    ramen: RamenInfo;
}

const RamenInfoTable: React.FC<RamenInfoTableProps> = ({ ramen }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        // 찜 상태 확인 로직 (임시로 찜 상태를 false로 설정)
        // 실제 구현 시에는 서버에서 찜 상태를 확인하여 설정해야 함
        setIsFavorite(ramen.isLiked);

        // 찜 상태 확인 로직
        // axios
        //     .get(`${process.env.REACT_APP_API_SERVER}/api/user/favorite`, {
        //         headers: {
        //             Authorization: `Bearer ${token}`,
        //         },
        //     })
        //     .then((response) => {
        //         const favorites = response.data.data.content;
        //         const isFav = favorites.some((fav: any) => fav.r_idx === ramen.r_idx);
        //         setIsFavorite(isFav);
        //     })
        //     .catch((error) => {
        //         console.error("찜 상태 확인 실패:", error);
        //     });
    }, [ramen.r_idx]);

    const handleFavoriteToggle = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (isFavorite) {
            axios
                .delete(`${process.env.REACT_APP_API_SERVER}/api/favorites`, {
                    data: { ramyunIdx: ramen.r_idx },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then(() => {
                    setIsFavorite(false);
                    alert("찜 해제되었습니다.");
                })
                .catch((error) => {
                    console.error("찜 해제 실패:", error);
                });
        } else {
            axios
                .post(
                    `${process.env.REACT_APP_API_SERVER}/api/favorites`,
                    {
                        ramyunIdx: ramen.r_idx,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                .then(() => {
                    setIsFavorite(true);
                    alert("찜 되었습니다.");
                })
                .catch((error) => {
                    console.error("찜 추가 실패:", error);
                });
        }
    };

    if (!ramen) {
        return <div>Loading...</div>;
    }

    return (
        <div className="ramen-info-table-container">
            <div className="ramen-name-container">
                <FontAwesomeIcon
                    icon={isFavorite ? solidHeart : regularHeart}
                    onClick={handleFavoriteToggle}
                    className={`favorite-icon ${isFavorite ? "fa-solid" : "fa-regular"}`}
                />
                <div className="ramen-name">{ramen.r_name}</div>
            </div>
            <table className="ramen-info-table">
                <thead>
                    <tr>
                        <th>항목</th>
                        <th>정보</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>브랜드</td>
                        <td>{ramen.b_name}</td>
                    </tr>
                    <tr>
                        <td>칼로리</td>
                        <td>{ramen.r_kcal} kcal</td>
                    </tr>
                    <tr>
                        <td>면 종류</td>
                        <td>{ramen.r_noodle ? "유지" : "비유지"}</td>
                    </tr>
                    <tr>
                        <td>컵라면 여부</td>
                        <td>{ramen.r_is_cup ? "예" : "아니오"}</td>
                    </tr>
                    <tr>
                        <td>조리 필요 여부</td>
                        <td>{ramen.r_cooking ? "예" : "아니오"}</td>
                    </tr>
                    <tr>
                        <td>중량</td>
                        <td>{ramen.r_gram} g</td>
                    </tr>
                    <tr>
                        <td>나트륨</td>
                        <td>{ramen.r_na} mg</td>
                    </tr>
                    <tr>
                        <td>스코빌 지수</td>
                        <td>{ramen?.r_scoville ?? "정보 없음"}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default RamenInfoTable;
