import { PrismaClient, Role, ExamLevel, QuestionSection } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu nạp dữ liệu mẫu (Seeding Korean Web Learning)...');

  // Xóa dữ liệu cũ nếu có
  await prisma.answerDetail.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.option.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.classroomMember.deleteMany({});
  await prisma.classroom.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Tạo Giáo viên
  const teacher = await prisma.user.create({
    data: {
      email: 'thaykim@koreanweb.vn',
      name: 'Thầy Kim (김선생님)',
      role: Role.TEACHER,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // 2. Tạo Học sinh
  const student1 = await prisma.user.create({
    data: {
      email: 'nguyenminh@koreanweb.vn',
      name: 'Nguyễn Văn Minh',
      role: Role.STUDENT,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'lethuha@koreanweb.vn',
      name: 'Lê Thu Hà',
      role: Role.STUDENT,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    },
  });

  // 3. Tạo Lớp học
  const classroom = await prisma.classroom.create({
    data: {
      name: 'Lớp Luyện Thi TOPIK I Sơ Cấp (K-TOP101)',
      code: 'TOPIK2026',
      description: 'Lớp học trọng điểm ôn tập ngữ pháp, giải đề thi thử TOPIK I cấp độ 1-2 và luyện kỹ năng đọc hiểu.',
      teacherId: teacher.id,
    },
  });

  // Thêm học sinh vào lớp
  await prisma.classroomMember.createMany({
    data: [
      { classroomId: classroom.id, studentId: student1.id },
      { classroomId: classroom.id, studentId: student2.id },
    ],
  });

  // 4. Tạo Đề thi TOPIK I chuẩn mẫu
  const exam = await prisma.exam.create({
    data: {
      title: 'Đề Thi Thử TOPIK I - Đọc Hiểu & Ngữ Pháp (Mã đề: K-01)',
      description: 'Đề luyện thi cấu trúc chuẩn TOPIK I gồm các dạng câu hỏi từ vựng, ngữ pháp cơ bản và đọc hiểu câu/đoạn văn.',
      level: ExamLevel.TOPIK_I,
      durationMinutes: 30,
      totalPoints: 100,
      isPublished: true,
      teacherId: teacher.id,
      classroomId: classroom.id,
    },
  });

  // 5. Thêm các câu hỏi vào Đề thi
  // Câu 1: Chủ đề từ vựng
  const q1 = await prisma.question.create({
    data: {
      examId: exam.id,
      order: 1,
      section: QuestionSection.VOCAB_GRAMMAR,
      title: 'Chủ đề từ vựng',
      passage: '사과가 맛있습니다. 바나나도 맛있습니다.',
      content: '무엇에 대한 이야기입니까? 알맞은 것을 고르십시오.',
      points: 20,
      explanation: '사과 (quả táo), 바나나 (chuối), 맛있습니다 (ngon). Cả hai danh từ này đều thuộc nhóm 과일 (Hoa quả). Do đó đáp án chính xác là 과일.',
      options: {
        create: [
          { order: 1, text: '과일 (Hoa quả)', isCorrect: true },
          { order: 2, text: '날씨 (Thời tiết)', isCorrect: false },
          { order: 3, text: '요일 (Thứ trong tuần)', isCorrect: false },
          { order: 4, text: '나라 (Quốc gia)', isCorrect: false },
        ],
      },
    },
    include: { options: true },
  });

  // Câu 2: Trợ từ nơi chốn
  const q2 = await prisma.question.create({
    data: {
      examId: exam.id,
      order: 2,
      section: QuestionSection.VOCAB_GRAMMAR,
      title: 'Trợ từ tiếng Hàn',
      passage: '저는 도서관(____) 책을 읽습니다.',
      content: '빈칸에 들어갈 가장 알맞은 것을 고르십시오.',
      points: 20,
      explanation: 'Hành động "책을 읽습니다" (đọc sách) diễn ra tại địa điểm "도서관" (thư viện), do đó ta phải dùng trợ từ chỉ nơi chốn diễn ra hành động là 에서. Trợ từ 에 chỉ dùng khi gắn với động từ di chuyển (가다/오다) hoặc sự tồn tại (있다/없다).',
      options: {
        create: [
          { order: 1, text: '에', isCorrect: false },
          { order: 2, text: '에서', isCorrect: true },
          { order: 3, text: '을', isCorrect: false },
          { order: 4, text: '에게', isCorrect: false },
        ],
      },
    },
    include: { options: true },
  });

  // Câu 3: Liên từ liên kết vế đối lập
  const q3 = await prisma.question.create({
    data: {
      examId: exam.id,
      order: 3,
      section: QuestionSection.READING,
      title: 'Liên từ nối câu',
      passage: '날씨가 좋습니다. (____) 바람이 많이 붑니다.',
      content: '빈칸에 들어갈 가장 알맞은 것을 고르십시오.',
      points: 20,
      explanation: 'Vế trước: "날씨가 좋습니다" (Thời tiết đẹp). Vế sau: "바람이 많이 붑니다" (Gió thổi nhiều). Hai vế mang nghĩa tương phản nhau, vì vậy cần dùng liên từ đối lập "하지만" (Nhưng / Tuy nhiên).',
      options: {
        create: [
          { order: 1, text: '그리고 (Và)', isCorrect: false },
          { order: 2, text: '그래서 (Vì vậy)', isCorrect: false },
          { order: 3, text: '하지만 (Tuy nhiên)', isCorrect: true },
          { order: 4, text: '그러면 (Nếu vậy thì)', isCorrect: false },
        ],
      },
    },
    include: { options: true },
  });

  // Câu 4: Đọc hiểu đoạn văn
  const q4 = await prisma.question.create({
    data: {
      examId: exam.id,
      order: 4,
      section: QuestionSection.READING,
      title: 'Đọc hiểu nội dung',
      passage: '저는 한국 노래를 좋아합니다. 그래서 매일 한국 노래를 듣습니다. 한국 노래를 들으면서 한국어를 공부합니다.',
      content: '이 글의 내용과 같은 것을 고르십시오.',
      points: 20,
      explanation: 'Đoạn văn nêu rõ: "한국 노래를 들으면서 한국어를 공부합니다" (Tôi vừa nghe bài hát Hàn Quốc vừa học tiếng Hàn), hoàn toàn trùng khớp với đáp án 3.',
      options: {
        create: [
          { order: 1, text: '저는 한국 노래를 싫어합니다.', isCorrect: false },
          { order: 2, text: '저는 매일 한국 노래를 부릅니다.', isCorrect: false },
          { order: 3, text: '저는 노래를 들으면서 한국어를 공부합니다.', isCorrect: true },
          { order: 4, text: '저는 한국어 공부를 끝냈습니다.', isCorrect: false },
        ],
      },
    },
    include: { options: true },
  });

  // Câu 5: Chia đuôi thì quá khứ
  const q5 = await prisma.question.create({
    data: {
      examId: exam.id,
      order: 5,
      section: QuestionSection.VOCAB_GRAMMAR,
      title: 'Chia đuôi câu thì quá khứ',
      passage: '가: 주말에 뭐 했어요?\n나: 친구를 (____).',
      content: '다음 대화의 빈칸에 알맞은 말을 고르십시오.',
      points: 20,
      explanation: 'Câu hỏi dùng thì quá khứ "뭐 했어요?" (Bạn đã làm gì vào cuối tuần?), nên câu trả lời phải chia đuôi thì quá khứ -았/었어요, cụ thể là "만났어요" (Đã gặp bạn).',
      options: {
        create: [
          { order: 1, text: '만났어요', isCorrect: true },
          { order: 2, text: '만나요', isCorrect: false },
          { order: 3, text: '만날 거예요', isCorrect: false },
          { order: 4, text: '만나고 싶어요', isCorrect: false },
        ],
      },
    },
    include: { options: true },
  });

  // 6. Tạo 1 bài làm mẫu (Submission) của student1 với kết quả 80% (đúng 4/5, sai câu 3)
  const sub1 = await prisma.submission.create({
    data: {
      examId: exam.id,
      studentId: student1.id,
      score: 80,
      maxScore: 100,
      percentage: 80,
      passed: true,
      aiReview: 'Học viên nắm rất vững trợ từ nơi chốn, thì quá khứ và từ vựng cơ bản. Cần lưu ý cách sử dụng liên từ tương phản (하지만 vs 그래서) để đạt điểm tuyệt đối.',
    },
  });

  // Chi tiết từng câu của student1
  const opt1Correct = q1.options.find((o) => o.isCorrect)!;
  const opt2Correct = q2.options.find((o) => o.isCorrect)!;
  const opt3Wrong = q3.options.find((o) => o.text.includes('그래서'))!; // Học sinh chọn nhầm 그래서
  const opt4Correct = q4.options.find((o) => o.isCorrect)!;
  const opt5Correct = q5.options.find((o) => o.isCorrect)!;

  await prisma.answerDetail.createMany({
    data: [
      {
        submissionId: sub1.id,
        questionId: q1.id,
        selectedOptionId: opt1Correct.id,
        isCorrect: true,
        pointsAwarded: 20,
      },
      {
        submissionId: sub1.id,
        questionId: q2.id,
        selectedOptionId: opt2Correct.id,
        isCorrect: true,
        pointsAwarded: 20,
      },
      {
        submissionId: sub1.id,
        questionId: q3.id,
        selectedOptionId: opt3Wrong.id,
        isCorrect: false,
        pointsAwarded: 0,
        aiFeedback: '❌ Em đã chọn "그래서" (Vì vậy). Trong câu này, vế trước là "Thời tiết đẹp", vế sau là "Gió thổi nhiều". Hai trạng thái mang tính tương phản, nên cần dùng liên từ "하지만" (Nhưng / Tuy nhiên). Dùng "그래서" sẽ khiến câu mang nghĩa phi logic.',
      },
      {
        submissionId: sub1.id,
        questionId: q4.id,
        selectedOptionId: opt4Correct.id,
        isCorrect: true,
        pointsAwarded: 20,
      },
      {
        submissionId: sub1.id,
        questionId: q5.id,
        selectedOptionId: opt5Correct.id,
        isCorrect: true,
        pointsAwarded: 20,
      },
    ],
  });

  // 7. Tạo Tài liệu học tập mẫu
  await prisma.material.create({
    data: {
      title: 'Bí Kíp Phân Biệt Trợ Từ 에 và 에서 Cực Chuẩn Cho TOPIK I',
      description: 'Tổng hợp ngữ pháp và bảng so sánh chi tiết giữa trợ từ hướng/tồn tại 에 và trợ từ nơi chốn hành động 에서.',
      type: 'GRAMMAR',
      content: `### 🎯 Phân biệt trợ từ [에] và [에서] trong tiếng Hàn

#### 1. Trợ từ [에]:
- **Biểu thị phương hướng/đích đến:** Đi kèm với các động từ di chuyển như 가다 (đi), 오다 (đến), 다니다 (đi lại thường xuyên).
  - *Ví dụ:* 학교에 가요 (Tôi đi đến trường).
- **Biểu thị sự tồn tại:** Đi kèm với 있다 (có, ở), 없다 (không có, không ở).
  - *Ví dụ:* 집에 있어요 (Tôi đang ở nhà).
- **Biểu thị mốc thời gian:** 
  - *Ví dụ:* 7시에 일어나요 (Tôi thức dậy lúc 7 giờ).

#### 2. Trợ từ [에서]:
- **Biểu thị nơi diễn ra hành động:** Đi kèm với các động từ hành động như 공부하다, 밥을 먹다, 일하다, 책을 읽다.
  - *Ví dụ:* 도서관에서 책을 읽어요 (Tôi đọc sách ở thư viện).
- **Biểu thị xuất phát điểm ("từ..."):**
  - *Ví dụ:* 베트남에서 왔어요 (Tôi đến từ Việt Nam).`,
      teacherId: teacher.id,
      classroomId: classroom.id,
    },
  });

  console.log('✅ Hoàn tất nạp dữ liệu mẫu thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
