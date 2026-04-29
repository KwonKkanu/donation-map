import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 백엔드 창고(API) 역할을 하는 라우트입니다.
// 클라이언트에서 웹브라우저를 통해 GET /api/campaigns 주소로 데이터를 요청하면 이 함수가 실행됩니다.
export async function GET() {
  // 프로젝트 폴더 내부에 있는 processed/campaigns.json 파일의 절대 경로를 찾습니다.
  const filePath = path.join(process.cwd(), 'processed', 'campaigns.json');
  
  if (!fs.existsSync(filePath)) {
    // 만약 아직 크롤링이 이루어지지 않아서 데이터 파일이 없다면 에러 메시지를 보냅니다.
    // 빈 배열을 함께 내려보내서 프론트엔드가 멈추거나 터지지 않도록 방어합니다.
    return NextResponse.json(
      { error: '데이터를 찾을 수 없습니다. 크롤러를 한번 돌려주세요.', items: [] }, 
      { status: 404 }
    );
  }

  // JSON 파일의 글자들을 읽어옵니다.
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  // 글자(String)를 자바스크립트 객체(Object) 모양으로 예쁘게 파싱합니다.
  const data = JSON.parse(fileContent);

  // 파싱된 데이터를 프론트엔드에게 무사히 전달(Return)해줍니다!
  return NextResponse.json(data);
}
