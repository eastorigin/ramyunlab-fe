import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import styles from "./RamyunList.module.scss";
import Pagination from "./../Pagination/Pagination.tsx"; // Pagination 컴포넌트 임포트

const brandMapping = {
    "1": "농심",
    "2": "삼양",
    "3": "오뚜기",
    "4": "팔도",
};

const noodleMapping = {
    "1": true,
    "0": false,
};

const isCupMapping = {
    "1": true,
    "0": false,
};

const cookingMapping = {
    "1": true,
    "0": false,
};

const kcalMapping = {
    "1": "~300",
    "2": "300~500",
    "3": "500~",
};

const gramMapping = {
    "1": "0-100",
    "2": "100~",
};

const naMapping = {
    "1": "~1000",
    "2": "1000~1400",
    "3": "1400~1700",
    "4": "1700~",
};

interface Ramyun {
    ramyunIdx: number;
    ramyunName: string;
    ramyunImg: string;
    brandName: string;
    noodle: boolean;
    ramyunKcal: number;
    isCup: boolean;
    cooking: boolean;
    gram: number;
    ramyunNa: number;
    scoville: number | null;
    avgRate: number;
    reviewCount: number;
    isLiked: boolean;
}

interface RamyunResponse {
    statusCode: number;
    message: string;
    data: {
        content: Ramyun[];
        pageable: {
            pageNumber: number;
            pageSize: number;
        };
        totalPages: number;
        totalElements: number;
    };
}

const RamyunList: React.FC = () => {
    const [sort, setSort] = useState<string>("name");
    const [direction, setDirection] = useState<string>("asc");
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const [filters, setFilters] = useState<any>({
        name: "",
        brand: [],
        noodle: [],
        isCup: [],
        cooking: [],
        kcal: [],
        gram: [],
        na: [],
    });

    const [searchText, setSearchText] = useState<string>("");

    const navigate = useNavigate();
    const location = useLocation();
    const avgRateButtonRef = useRef<HTMLButtonElement>(null);

    const getPageFromQuery = () => {
        const searchParams = new URLSearchParams(location.search);
        const pageFromQuery = parseInt(searchParams.get("page") || "1", 10);
        return isNaN(pageFromQuery) || pageFromQuery < 1 ? 1 : pageFromQuery;
    };

    const getSortFromQuery = () => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get("sort") || "name";
    };

    const getDirectionFromQuery = () => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get("direction") || "asc";
    };

    const getFiltersFromQuery = () => {
        const searchParams = new URLSearchParams(location.search);
        const filterKeys = ["name", "brand", "noodle", "isCup", "cooking", "kcal", "gram", "na"];
        const newFilters: any = {};
        filterKeys.forEach((key) => {
            newFilters[key] = searchParams.getAll(key);
        });
        return newFilters;
    };

    const [page, setPage] = useState<number>(getPageFromQuery());

    const fetchRamyunList = async (page: number, sort: string, direction: string, filters: any) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("sort", sort);
        params.append("direction", direction);
        Object.keys(filters).forEach((key) => {
            filters[key].forEach((value: any) => params.append(key, value));
        });
        const token = localStorage.getItem("token");
        const response = await axios.get<RamyunResponse>(
            `${process.env.REACT_APP_API_SERVER}/main/search?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    };

    const { data, error, isLoading, refetch } = useQuery(
        ["ramyunList", page, sort, direction, filters],
        () => fetchRamyunList(page, sort, direction, filters),
        { keepPreviousData: true }
    );

    useEffect(() => {
        const currentPage = getPageFromQuery();
        const currentSort = getSortFromQuery();
        const currentDirection = getDirectionFromQuery();
        const currentFilters = getFiltersFromQuery();

        setPage(currentPage);
        setSort(currentSort);
        if (sort === "name") setDirection(currentDirection);
        setFilters(currentFilters);
    }, [location.search]);

    const updateUrlParams = (
        newPage: number,
        newSort: string,
        newDirection: string,
        newFilters: any,
        shouldScroll: boolean
    ) => {
        const params = new URLSearchParams();
        params.set("page", newPage.toString());
        params.set("sort", newSort);
        params.set("direction", newDirection);
        Object.keys(newFilters).forEach((key) => {
            newFilters[key].forEach((value: any) => params.append(key, value));
        });
        navigate(`?${params.toString()}`, { replace: false });
        if (shouldScroll && avgRateButtonRef.current) {
            avgRateButtonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        updateUrlParams(newPage, sort, direction, filters, true);
    };

    const toggleSortDirection = () => {
        const newDirection = direction === "asc" ? "desc" : "asc";
        setDirection(newDirection);
        updateUrlParams(1, sort, newDirection, filters, false);
    };

    const handleSortChange = (newSort: string) => {
        if (newSort === "name" && sort === newSort) {
            toggleSortDirection();
        } else {
            setSort(newSort);
            updateUrlParams(1, newSort, "asc", filters, false);
            setPage(1);
        }
    };

    const handleFilterChange = (key: string, value: string, checked: boolean) => {
        const newFilters = { ...filters };
        if (checked) {
            newFilters[key] = [...newFilters[key], value];
        } else {
            newFilters[key] = newFilters[key].filter((v: string) => v !== value);
        }
        setFilters(newFilters);
        updateUrlParams(1, sort, direction, newFilters, false);
        setPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleSearchButtonClick = () => {
        const newFilters = { ...filters, name: [searchText] };
        setFilters(newFilters);
        updateUrlParams(1, sort, direction, newFilters, false);
        setPage(1);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearchButtonClick();
        }
    };

    const handleFavoriteAction = async (ramyunIdx: number, isLiked: boolean) => {
        const token = localStorage.getItem("token"); // Assuming you store JWT token in local storage
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            if (isLiked) {
                await axios.delete(`${process.env.REACT_APP_API_SERVER}/api/favorites`, {
                    data: { ramyunIdx },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                alert("찜 해제 완료!");
            } else {
                await axios.post(
                    `${process.env.REACT_APP_API_SERVER}/api/favorites`,
                    { ramyunIdx },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                alert("찜 완료!");
            }
        } catch (error) {
            alert("찜 작업 실패");
        }
    };

    const handleFavoriteToggle = async (ramyunIdx: number, isLiked: boolean) => {
        await handleFavoriteAction(ramyunIdx, isLiked);
        // Refresh data after favorite action
        refetch();
    };

    const handleRamyunClick = (ramyun: Ramyun) => {
        // 로그인한 사용자만 로컬 스토리지에 저장
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const userId = userInfo.userId;
        if (userId) {
            const viewedRamyunListKey = `viewedRamyunList_${userId}`;
            const viewedRamyunList = JSON.parse(localStorage.getItem(viewedRamyunListKey) || "[]");

            if (!viewedRamyunList.some((item: Ramyun) => item.ramyunIdx === ramyun.ramyunIdx)) {
                viewedRamyunList.push(ramyun);
            }

            localStorage.setItem(viewedRamyunListKey, JSON.stringify(viewedRamyunList));
        }

        // 상세 페이지로 이동
        navigate(`/main/ramyun/${ramyun.ramyunIdx}`, { state: { ramyun } });
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div>
                {error instanceof Error ? error.message : "Error occurred while fetching data"}
            </div>
        );
    }

    const ramyunList = data?.data?.content || [];

    return (
        <div className={styles.ramyunListContainer}>
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="라면을 검색해주세요!"
                    value={searchText}
                    onChange={handleSearchChange}
                    onKeyPress={handleKeyPress}
                    className={styles.searchInput}
                />
                <button onClick={handleSearchButtonClick} className={styles.searchButton}>
                    검색
                </button>
            </div>

            <div className={styles.filterContainer}>
                <div className={styles.filterRow}>
                    <div className={styles.filterTitles}>
                        <p>브랜드</p>
                        <p>면 유형</p>
                        <p>용기 기준</p>
                        <p>조리 유형</p>
                        <p>칼로리</p>
                        <p>그램</p>
                        <p>나트륨(mg)</p>
                    </div>
                    <div className={styles.filterGroups}>
                        <div className={styles.filterGroupContainer}>
                            <div className={styles.filterGroup}>
                                {Object.keys(brandMapping).map((key) => (
                                    <label
                                        key={key}
                                        className={`${
                                            filters.brand.includes(key) ? styles.active : ""
                                        } ${styles.label}`}
                                    >
                                        <input
                                            type="checkbox"
                                            value={key}
                                            checked={filters.brand.includes(key)}
                                            onChange={(e) =>
                                                handleFilterChange("brand", key, e.target.checked)
                                            }
                                        />
                                        {brandMapping[key]}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterGroupContainer}>
                            <div className={styles.filterGroup}>
                                {Object.keys(noodleMapping).map((key) => (
                                    <label
                                        key={key}
                                        className={`${
                                            filters.noodle.includes(key) ? styles.active : ""
                                        } ${styles.label}`}
                                    >
                                        <input
                                            type="checkbox"
                                            value={key}
                                            checked={filters.noodle.includes(key)}
                                            onChange={(e) =>
                                                handleFilterChange("noodle", key, e.target.checked)
                                            }
                                        />
                                        {noodleMapping[key] ? "유탕면" : "건면"}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterGroupContainer}>
                            <div className={styles.filterGroup}>
                                {Object.keys(isCupMapping).map((key) => (
                                    <label
                                        key={key}
                                        className={`${
                                            filters.isCup.includes(key) ? styles.active : ""
                                        } ${styles.label}`}
                                    >
                                        <input
                                            type="checkbox"
                                            value={key}
                                            checked={filters.isCup.includes(key)}
                                            onChange={(e) =>
                                                handleFilterChange("isCup", key, e.target.checked)
                                            }
                                        />
                                        {isCupMapping[key] ? "컵라면" : "봉지라면"}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterGroupContainer}>
                            <div className={styles.filterGroup}>
                                {Object.keys(cookingMapping).map((key) => (
                                    <label
                                        key={key}
                                        className={`${
                                            filters.cooking.includes(key) ? styles.active : ""
                                        } ${styles.label}`}
                                    >
                                        <input
                                            type="checkbox"
                                            value={key}
                                            checked={filters.cooking.includes(key)}
                                            onChange={(e) =>
                                                handleFilterChange("cooking", key, e.target.checked)
                                            }
                                        />
                                        {cookingMapping[key] ? "국물" : "볶음/비빔"}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterGroupContainer}>
                            <div className={styles.filterGroup}>
                                {Object.keys(kcalMapping).map((key) => (
                                    <label
                                        key={key}
                                        className={`${
                                            filters.kcal.includes(key) ? styles.active : ""
                                        } ${styles.label}`}
                                    >
                                        <input
                                            type="checkbox"
                                            value={key}
                                            checked={filters.kcal.includes(key)}
                                            onChange={(e) =>
                                                handleFilterChange("kcal", key, e.target.checked)
                                            }
                                        />
                                        {kcalMapping[key]}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterGroupContainer}>
                            <div className={styles.filterGroup}>
                                {Object.keys(gramMapping).map((key) => (
                                    <label
                                        key={key}
                                        className={`${
                                            filters.gram.includes(key) ? styles.active : ""
                                        } ${styles.label}`}
                                    >
                                        <input
                                            type="checkbox"
                                            value={key}
                                            checked={filters.gram.includes(key)}
                                            onChange={(e) =>
                                                handleFilterChange("gram", key, e.target.checked)
                                            }
                                        />
                                        {gramMapping[key]}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterGroupContainer}>
                            <div className={styles.filterGroup}>
                                {Object.keys(naMapping).map((key) => (
                                    <label
                                        key={key}
                                        className={`${
                                            filters.na.includes(key) ? styles.active : ""
                                        } ${styles.label}`}
                                    >
                                        <input
                                            type="checkbox"
                                            value={key}
                                            checked={filters.na.includes(key)}
                                            onChange={(e) =>
                                                handleFilterChange("na", key, e.target.checked)
                                            }
                                        />
                                        {naMapping[key]}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <button
                        className={`${styles.filterButton} ${sort === "name" ? styles.active : ""}`}
                        onClick={() => handleSortChange("name")}
                    >
                        이름 ({direction === "asc" ? "오름차순" : "내림차순"})
                    </button>
                </div>
                <div className={styles.filterGroup}>
                    <button
                        ref={avgRateButtonRef}
                        className={`${styles.filterButton} ${
                            sort === "avgRate" ? styles.active : ""
                        }`}
                        onClick={() => handleSortChange("avgRate")}
                    >
                        평점(높은순)
                    </button>
                </div>
                <div className={styles.filterGroup}>
                    <button
                        className={`${styles.filterButton} ${
                            sort === "reviewCount" ? styles.active : ""
                        }`}
                        onClick={() => handleSortChange("reviewCount")}
                    >
                        리뷰 개수(높은순)
                    </button>
                </div>
            </div>
            <div className={styles.ramyunList}>
                {ramyunList.length === 0 ? (
                    <div className={styles.noRamyunMessage}>해당되는 라면이 없습니다!</div>
                ) : (
                    ramyunList.map((ramyun, index) => (
                        <div
                            key={ramyun.ramyunIdx}
                            className={`${styles.ramyunItem} ${
                                ramyun.isLiked ? styles.favorite : ""
                            }`}
                            onClick={() => handleRamyunClick(ramyun)}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className={styles.topContainer}>
                                <FontAwesomeIcon
                                    icon={
                                        ramyun.isLiked || hoveredIndex === index
                                            ? solidHeart
                                            : regularHeart
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevents the item click handler
                                        handleFavoriteToggle(ramyun.ramyunIdx, ramyun.isLiked);
                                    }}
                                    className={`${styles.favoriteIcon} ${
                                        ramyun.isLiked ? styles.favorite : ""
                                    }`}
                                />
                            </div>

                            <img
                                src={ramyun.ramyunImg}
                                alt={ramyun.ramyunName}
                                className={styles.ramyunImg}
                            />
                            <h3>{ramyun.ramyunName}</h3>
                            <div className={styles.starRating}>
                                <FaStar color="gold" />
                                <span>{ramyun.avgRate.toFixed(1)}</span>
                                <span className={styles.reviewCount}>({ramyun.reviewCount})</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <Pagination
                totalPages={ramyunList.length === 0 ? 1 : data?.data?.totalPages || 0}
                currentPage={page}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default RamyunList;
