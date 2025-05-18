from flask import Flask,Response,json
from flask_cors import CORS
from models import db

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reservation.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# 첫 실행 시 DB 생성
with app.app_context():
    db.create_all()

@app.route('/ping')
def ping():
    return Response(
        response=json.dumps({"message": "서버 정상 작동 중!"}, ensure_ascii=False),
        status=200,
        mimetype="application/json"
    )

from flask import request, Response, json
from models import db, User

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return Response(
            response=json.dumps({"error": "이메일과 비밀번호를 모두 입력해주세요."}, ensure_ascii=False),
            status=400,
            mimetype='application/json'
        )

    if User.query.filter_by(email=email).first():
        return Response(
            response=json.dumps({"error": "이미 존재하는 이메일입니다."}, ensure_ascii=False),
            status=409,
            mimetype='application/json'
        )

    new_user = User(email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

    return Response(
        response=json.dumps({"message": "회원가입 성공!"}, ensure_ascii=False),
        status=201,
        mimetype='application/json'
    )

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return Response(
            response=json.dumps({"error": "이메일과 비밀번호를 모두 입력해주세요."}, ensure_ascii=False),
            status=400,
            mimetype='application/json'
        )

    user = User.query.filter_by(email=email, password=password).first()
    if not user:
        return Response(
            response=json.dumps({"error": "이메일 또는 비밀번호가 올바르지 않습니다."}, ensure_ascii=False),
            status=401,
            mimetype='application/json'
        )

    return Response(
        response=json.dumps({"message": "로그인 성공!", "user_id": user.id}, ensure_ascii=False),
        status=200,
        mimetype='application/json'
    )

from flask import request, Response, json
from models import db, Table, Reservation
from datetime import datetime

@app.route('/tables', methods=['GET'])
def get_available_tables():
    date_str = request.args.get('date')
    time_slot = request.args.get('time')  # lunch or dinner

    if not date_str or time_slot not in ['lunch', 'dinner']:
        return Response(
            response=json.dumps({"error": "날짜와 시간(lunch 또는 dinner)을 정확히 입력해주세요."}, ensure_ascii=False),
            status=400,
            mimetype='application/json'
        )

    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response(
            response=json.dumps({"error": "날짜 형식은 YYYY-MM-DD여야 합니다."}, ensure_ascii=False),
            status=400,
            mimetype='application/json'
        )

    # 해당 날짜에 이미 예약된 테이블 ID 조회
    reserved_tables = db.session.query(Reservation.table_id).filter_by(date=date).all()
    reserved_ids = [r[0] for r in reserved_tables]

    # 사용 가능한 테이블만 필터링
    available_tables = Table.query.filter(~Table.id.in_(reserved_ids)).all()

    table_list = [
        {
            "table_id": table.id,
            "location": table.location,
            "capacity": table.capacity
        }
        for table in available_tables
    ]

    return Response(
        response=json.dumps({"available_tables": table_list}, ensure_ascii=False),
        status=200,
        mimetype='application/json'
    )

@app.route('/init_tables', methods=['POST'])
def init_tables():
    # 이미 데이터 있으면 중복 삽입 방지
    if Table.query.first():
        return Response(
            response=json.dumps({"message": "이미 테이블 데이터가 존재합니다."}, ensure_ascii=False),
            status=400,
            mimetype='application/json'
        )

    tables = [
        Table(location='window', capacity=2),
        Table(location='window', capacity=4),
        Table(location='inside', capacity=4),
        Table(location='room', capacity=6),
        Table(location='room', capacity=8),
    ]

    db.session.bulk_save_objects(tables)
    db.session.commit()

    return Response(
        response=json.dumps({"message": "테이블 데이터가 초기화되었습니다."}, ensure_ascii=False),
        status=201,
        mimetype='application/json'
    )

from datetime import datetime, timedelta

@app.route('/reserve', methods=['POST'])
def reserve():
    data = request.get_json()
    name = data.get('name')
    phone = data.get('phone')
    card = data.get('card')
    guests = data.get('guests')
    table_id = data.get('table_id')
    date_str = data.get('date')
    user_id = data.get('user_id')

    # 필수 입력값 확인
    if not all([name, phone, card, guests, table_id, date_str, user_id]):
        return Response(
            response=json.dumps({"error": "모든 필드를 입력해주세요."}, ensure_ascii=False),
            status=400,
            mimetype='application/json'
        )

    # 날짜 형식 검증
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response(
            response=json.dumps({"error": "날짜 형식은 YYYY-MM-DD입니다."}, ensure_ascii=False),
            status=400,
            mimetype='application/json'
        )

    # 날짜 유효성 검사: 오늘로부터 1달 이내만 예약 가능
    today = datetime.today().date()
    if date < today or date > today + timedelta(days=30):
        return Response(
            response=json.dumps({"error": "예약 날짜는 오늘부터 30일 이내여야 합니다."}, ensure_ascii=False),
            status=400,
            mimetype='application/json'
        )

    # 이미 예약된 테이블인지 확인
    existing = Reservation.query.filter_by(date=date, table_id=table_id).first()
    if existing:
        return Response(
            response=json.dumps({"error": "이미 예약된 테이블입니다."}, ensure_ascii=False),
            status=409,
            mimetype='application/json'
        )

    # 예약 저장
    reservation = Reservation(
        user_id=user_id,
        table_id=table_id,
        name=name,
        phone=phone,
        card=card,
        guests=guests,
        date=date
    )
    db.session.add(reservation)
    db.session.commit()

    return Response(
        response=json.dumps({"message": "예약이 완료되었습니다!"}, ensure_ascii=False),
        status=201,
        mimetype='application/json'
    )

from datetime import datetime

@app.route('/cancel/<int:reservation_id>', methods=['DELETE'])
def cancel_reservation(reservation_id):
    data = request.get_json()
    user_id = data.get('user_id')

    # user_id는 필수
    if not user_id:
        return Response(
            response=json.dumps({"error": "user_id가 필요합니다."}, ensure_ascii=False),
            status=400,
            mimetype='application/json'
        )

    reservation = Reservation.query.get(reservation_id)
    if not reservation:
        return Response(
            response=json.dumps({"error": "해당 예약을 찾을 수 없습니다."}, ensure_ascii=False),
            status=404,
            mimetype='application/json'
        )

    if reservation.user_id != user_id:
        return Response(
            response=json.dumps({"error": "본인의 예약만 취소할 수 있습니다."}, ensure_ascii=False),
            status=403,
            mimetype='application/json'
        )

    if reservation.date <= datetime.today().date():
        return Response(
            response=json.dumps({"error": "예약 당일에는 취소할 수 없습니다."}, ensure_ascii=False),
            status=400,
            mimetype='application/json'
        )

    db.session.delete(reservation)
    db.session.commit()

    return Response(
        response=json.dumps({"message": "예약이 취소되었습니다."}, ensure_ascii=False),
        status=200,
        mimetype='application/json'
    )


if __name__ == '__main__':
    app.run(debug=True)
