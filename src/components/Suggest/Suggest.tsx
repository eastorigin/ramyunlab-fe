import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Modal.module.scss";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Suggest: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const [userEmail, setUserEmail] = useState("chu@name.com"); // 초기값 설정
    const [message, setMessage] = useState(
        "저 불닭볶음면에 댓글달아놨는데 이거 너무 매워서 불호라고 썻는데 며칠지나고 보니까 블라인드가 되어있어요. 이거 블라인드 풀어주세요"
    ); // 초기값 설정
    const [title, setTitle] = useState("제 댓글이 왜 블라인드 처리가 되었을까요?"); // 초기값 설정
    const [isValidEmail, setIsValidEmail] = useState(true);
    const [userId, setUserId] = useState("");

    useEffect(() => {
        if (isOpen) {
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            if (userInfo && userInfo.userId) {
                setUserId(userInfo.userId);
            }
        }
    }, [isOpen]);

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        setUserEmail(email);
        setIsValidEmail(validateEmail(email));
    };

    const handleSendEmail = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isValidEmail) {
            return;
        }
        try {
            const token = localStorage.getItem("token"); // 토큰을 로컬 스토리지에서 가져옴
            const response = await axios.post(
                `${process.env.REACT_APP_API_SERVER}/admin/mail`,
                {
                    userId,
                    userEmail,
                    subject: title, // 제목 추가
                    text: message, // 내용 추가
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // 토큰 추가
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                }
            );

            if (response.status === 200) {
                alert("이메일 발송이 완료되었습니다.");
                // 입력 필드 초기화
                setUserEmail("chu@name.com"); // 초기값으로 재설정
                setTitle("제 댓글이 블라인드 처리가 되었을까요?"); // 초기값으로 재설정
                setMessage(
                    "저 불닭볶음면에 댓글달아놨는데 이거 너무 매워서 불호라고 썻는데 며칠지나고 보니까 블라인드가 되어있어요. 이거 블라인드 풀어주세요"
                ); // 초기값으로 재설정
                onClose();
            } else {
                alert("이메일 발송에 실패했습니다: " + response.data.message);
            }
        } catch (error) {
            alert("이메일 발송에 실패했습니다.");
            console.log(error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>건의하기</h2>
                <form onSubmit={handleSendEmail}>
                    <div>
                        <label>아이디</label>
                        <input type="text" value={userId} readOnly />
                    </div>
                    <div>
                        <label>회원 이메일</label>
                        <input
                            type="email"
                            value={userEmail}
                            onChange={handleEmailChange}
                            className={isValidEmail ? "" : styles.invalid}
                        />
                        {!isValidEmail && (
                            <p className={styles.errorText}>유효한 이메일을 입력해주세요.</p>
                        )}
                    </div>
                    <div>
                        <label>제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={styles.titleInput}
                        />
                    </div>
                    <div>
                        <label>내용</label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="submit">발송</button>
                        <button type="button" onClick={onClose}>
                            닫기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Suggest;
