import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Modal.module.scss";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Suggest: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const [userEmail, setUserEmail] = useState("");
    const [message, setMessage] = useState("");
    const [title, setTitle] = useState(""); // 제목 상태 추가
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
        event.preventDefault(); // Prevent default form submission behavior
        if (!isValidEmail) {
            return;
        }
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_SERVER}/mail`, {
                userEmail,
                title, // 제목 추가
                message,
            });

            if (response.data.statusCode === 200) {
                alert("이메일 발송이 완료되었습니다.");
                onClose(); // 이메일 발송 성공 후 모달 닫기
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
        <div className={styles.modalBackdrop}>
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