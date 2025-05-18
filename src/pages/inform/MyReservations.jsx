import React, { useEffect, useState } from 'react';
import useAuthGuard from '../../hooks/useAuthGuard';
import './inform.css';

function MyReservations() {
  useAuthGuard(); 

  const [reservations, setReservations] = useState([]);

  //더미데이터 => 연동 후 삭제
  useEffect(() => {
    const dummyData = [
      {
        id: 1,
        name: 'ㅁㅁㅁ',
        date: '2025-05-19',
        time: '점심',
        people: 3,
        table: { label: '4', position: 'window' },
        reserver: 'ㅁㅁㅁ'
      },
      {
        id: 2,
        name: 'ㅁㅁㅁ',
        date: '2025-05-30',
        time: '저녁',
        people: 2,
        table: { label: '2', position: 'hall' },
        reserver: 'ㅁㅁㅁ'
      }
    ];
    setReservations(dummyData);
  }, []);

  const handleCancel = (res) => {
    const today = new Date();
    const resDate = new Date(res.date);

    today.setHours(0, 0, 0, 0);
    resDate.setHours(0, 0, 0, 0);

    const isSameDay = resDate.getTime() === today.getTime();
    const isPast = resDate.getTime() < today.getTime();

    if (isSameDay || isPast) {
      alert('예약 당일에는 취소할 수 없습니다.');
      return;
    }

    if (window.confirm('정말 이 예약을 취소하시겠습니까?')) {
      setReservations((prev) => prev.filter((r) => r.id !== res.id));
    }
  };

  return (
    <div className="reservation-page">
      <h2>예약 확인</h2>
      {reservations.length === 0 ? (
        <p>예약 내역이 없습니다.</p>
      ) : (
        <div className="reservation-list">
          {reservations.map((res) => (
            <div className="reservation-card" key={res.id}>
              <div className="reservation-info">
                <p><strong>날짜/시간:</strong> {res.date} / {res.time}</p>
                <p><strong>예약자:</strong> {res.name}</p>
                <p><strong>인원:</strong> {res.people}명</p>
                <p><strong>테이블:</strong> {res.table.position} / {res.table.label}인석</p>
              </div>
              <div className="reservation-actions">
                <button onClick={() => handleCancel(res)} className="cancel-btn">
                  예약 취소
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyReservations;