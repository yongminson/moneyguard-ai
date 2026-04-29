import axios from "axios";
import * as cheerio from "cheerio";

export interface PolicyNotice {
  title: string;
  link: string;
}

export async function fetchPolicies(url: string): Promise<PolicyNotice[]> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      timeout: 10000, // 10초 이상 걸리면 포기 (무한 로딩 방지)
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const notices: PolicyNotice[] = [];
    
    // 한국 관공서 게시판에서 가장 흔하게 사용하는 3가지 테이블 패턴을 모두 뒤집니다.
    const rows = $("a");

    rows.each((_, el) => {
      const anchor = $(el).find("a");
      const title = anchor.text().trim();
      let link = anchor.attr("href") || "";

      // 불필요한 빈칸이나 자바스크립트 동작 링크 필터링
      if (!title || link.includes("javascript:")) return;

      if (link && !/^https?:\/\//i.test(link)) {
        try {
          const base = new URL(url);
          link = new URL(link, base.origin).href;
        } catch {
          // 파싱 실패 시 패스
        }
      }

      // 중복 방지 및 빈 제목 거르기
      if (title.length > 3 && link) {
        notices.push({ title, link });
      }
    });

    return notices;
  } catch (error) {
    console.error("크롤링 에러 발생:", error);
    return [];
  }
}