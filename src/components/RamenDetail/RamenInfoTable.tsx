import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping } from "@fortawesome/free-solid-svg-icons";

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
    r_scoville: number | null;
}

interface RamenInfoTableProps {
    ramen: RamenInfo;
}

const RamenInfoTable: React.FC<RamenInfoTableProps> = ({ ramen }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    const handleFavoriteToggle = () => {
        const token = localStorage.getItem("token");
        const currentDate = new Date().toISOString();

        axios
            .post(
                `${process.env.REACT_APP_API_SERVER}/api/favorites`,
                {
                    r_idx: ramen.r_idx,
                    created_at: currentDate,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((response) => {
                setIsFavorite(!isFavorite);
                alert(isFavorite ? "찜 해제되었습니다." : "찜 되었습니다.");
            })
            .catch((error) => {
                console.error("찜 처리 실패:", error);
            });
    };

    if (!ramen) {
        return <div>Loading...</div>;
    }

    return (
        <div className="ramen-info-table-container">
            <div className="ramen-name-container">
                <div className="ramen-name">{ramen.r_name}</div>
                <FontAwesomeIcon
                    icon={faBagShopping}
                    onClick={handleFavoriteToggle}
                    className={`favorite-icon ${isFavorite ? "favorite" : ""}`}
                />
            </div>
            <table className="ramen-info-table">
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
                        <td>{ramen.r_scoville !== null ? ramen.r_scoville : "정보 없음"}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default RamenInfoTable;
