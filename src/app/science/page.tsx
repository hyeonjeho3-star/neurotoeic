'use client';

import { Brain, Zap, RefreshCw, Target, Clock, TrendingUp, Lightbulb, CheckCircle2, BookOpen } from 'lucide-react';

export default function SciencePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="text-orange-500" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            뇌과학 기반 학습
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          NeuroTOEIC이 적용한 과학적 학습 원리와 효율적인 사용법
        </p>
      </div>

      {/* Core Principles */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Zap className="text-orange-500" size={24} />
          핵심 학습 원리
        </h2>

        {/* Forgetting Curve */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            1. 망각 곡선 (Forgetting Curve)
          </h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                1885년 독일의 심리학자 <strong>헤르만 에빙하우스</strong>가 발견한 망각 곡선에 따르면,
                새로 학습한 정보는 시간이 지남에 따라 급격히 잊혀집니다.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>20분 후:</strong> 약 42% 망각</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>1시간 후:</strong> 약 56% 망각</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>1일 후:</strong> 약 67% 망각</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>1달 후:</strong> 약 79% 망각</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="h-40 flex items-end justify-around gap-2">
                {[100, 58, 44, 33, 21].map((height, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t"
                      style={{ height: `${height * 1.5}px` }}
                    />
                    <span className="text-xs text-gray-500">{['즉시', '20분', '1시간', '1일', '1달'][i]}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">기억 유지율 (%)</p>
            </div>
          </div>
        </div>

        {/* Spaced Repetition */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            2. 간격 반복 (Spaced Repetition)
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            망각 곡선의 해결책! <strong>잊혀지기 직전에 복습</strong>하면 기억이 강화되고,
            다음 복습까지의 간격이 점점 늘어납니다. 이것이 <strong>간격 반복 학습법</strong>입니다.
          </p>
          <div className="bg-gradient-to-r from-orange-50 to-green-50 dark:from-orange-900/20 dark:to-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-300">복습 간격 변화</span>
              <span className="text-green-600 dark:text-green-400">기억 강화!</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['1일', '3일', '1주', '2주', '1달', '3달'].map((interval, i) => (
                <div key={i} className="flex items-center">
                  <div className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium whitespace-nowrap">
                    {interval}
                  </div>
                  {i < 5 && <span className="mx-1 text-gray-400">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Recall */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            3. 능동적 회상 (Active Recall)
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            단순히 읽는 것보다 <strong>직접 떠올리려고 노력</strong>할 때 기억이 더 강하게 형성됩니다.
            이를 <strong>&quot;테스트 효과&quot;</strong> 또는 <strong>&quot;인출 연습&quot;</strong>이라고 합니다.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-2">❌ 비효율적</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                단어장을 반복해서 읽기<br/>
                형광펜으로 밑줄 긋기<br/>
                여러 번 베껴 쓰기
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-green-600 dark:text-green-400 font-semibold mb-2">✅ 효율적</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                뜻을 보고 단어 떠올리기<br/>
                단어를 보고 뜻 떠올리기<br/>
                스스로 테스트하기
              </p>
            </div>
          </div>
        </div>

        {/* Desirable Difficulty */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            4. 바람직한 어려움 (Desirable Difficulty)
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            학습이 약간 어려울 때 기억이 더 오래 지속됩니다.
            너무 쉬운 복습은 시간 낭비이고, 너무 어려우면 좌절감을 줍니다.
            NeuroTOEIC은 <strong>최적의 난이도</strong>로 복습 시점을 조절합니다.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                <span className="text-2xl">😴</span>
              </div>
              <p className="text-sm text-gray-500">너무 쉬움</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2 ring-4 ring-green-500">
                <span className="text-3xl">🎯</span>
              </div>
              <p className="text-sm text-green-600 font-semibold">최적</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                <span className="text-2xl">😫</span>
              </div>
              <p className="text-sm text-gray-500">너무 어려움</p>
            </div>
          </div>
        </div>
      </section>

      {/* FSRS Algorithm */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <RefreshCw className="text-orange-500" size={24} />
          FSRS 4.5 알고리즘
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            NeuroTOEIC은 <strong>FSRS (Free Spaced Repetition Scheduler) 4.5</strong> 알고리즘을 사용합니다.
            이는 기존 SM-2 알고리즘의 한계를 극복하고, 머신러닝을 기반으로 개발된 최신 알고리즘입니다.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">핵심 요소</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-green-500 mt-0.5" size={16} />
                  <span><strong>안정성 (Stability):</strong> 기억이 얼마나 견고한지</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-green-500 mt-0.5" size={16} />
                  <span><strong>난이도 (Difficulty):</strong> 카드가 얼마나 어려운지</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-green-500 mt-0.5" size={16} />
                  <span><strong>인출 가능성 (Retrievability):</strong> 현재 기억해낼 확률</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">장점</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-green-500 mt-0.5" size={16} />
                  <span>개인별 학습 패턴에 맞춤 조정</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-green-500 mt-0.5" size={16} />
                  <span>실제 연구 데이터 기반 최적화</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-green-500 mt-0.5" size={16} />
                  <span>SM-2 대비 학습 효율 20%+ 향상</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>💡 참고:</strong> FSRS는 오픈소스로 공개되어 있으며, Anki에서도 채택한 검증된 알고리즘입니다.
              복습 시 &quot;Again / Hard / Good / Easy&quot; 버튼을 누르면 FSRS가 다음 복습 일정을 자동으로 계산합니다.
            </p>
          </div>
        </div>
      </section>

      {/* How to Use Effectively */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Target className="text-orange-500" size={24} />
          효율적인 학습 방법
        </h2>

        <div className="space-y-4">
          {/* Tip 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <Clock className="text-orange-500" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  1. 매일 조금씩, 꾸준히
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  벼락치기보다 매일 15-30분씩 학습하는 것이 훨씬 효과적입니다.
                  간격 반복의 효과를 극대화하려면 <strong>매일 복습 카드를 처리</strong>하세요.
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm">
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>추천:</strong> 아침에 일어나서 10분, 점심 후 10분, 자기 전 10분
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tip 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="text-orange-500" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  2. 정직하게 평가하기
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  답을 보기 전에 먼저 스스로 떠올려 보세요. 그리고 <strong>정직하게</strong> 평가하세요.
                  거짓으로 &quot;Easy&quot;를 누르면 알고리즘이 왜곡되어 나중에 더 많이 틀리게 됩니다.
                </p>
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div className="bg-red-100 dark:bg-red-900/30 rounded p-2">
                    <p className="font-semibold text-red-600 dark:text-red-400">Again</p>
                    <p className="text-xs text-gray-500">전혀 모름</p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 rounded p-2">
                    <p className="font-semibold text-orange-600 dark:text-orange-400">Hard</p>
                    <p className="text-xs text-gray-500">힘들게 생각남</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 rounded p-2">
                    <p className="font-semibold text-green-600 dark:text-green-400">Good</p>
                    <p className="text-xs text-gray-500">적당히 생각남</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded p-2">
                    <p className="font-semibold text-blue-600 dark:text-blue-400">Easy</p>
                    <p className="text-xs text-gray-500">즉시 생각남</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tip 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-orange-500" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  3. 새 카드는 적당히
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  하루에 너무 많은 새 카드를 학습하면 복습이 쌓여서 부담이 됩니다.
                  <strong>하루 15-25개</strong>의 새 카드가 적당합니다.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-sm">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    <strong>⚠️ 주의:</strong> 새 카드를 많이 추가하면 며칠 후 복습량이 급증합니다.
                    처음에는 적게 시작해서 점차 늘려가세요.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tip 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <Brain className="text-orange-500" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  4. 연관 지어 기억하기
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  단어를 단독으로 외우지 말고, 예문이나 상황과 함께 기억하세요.
                  이미지나 이야기를 떠올리면 기억이 더 오래 지속됩니다.
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm">
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>예시:</strong> &quot;affordable&quot;을 외울 때 &quot;afford(여유가 있다) + able&quot;로 분해하고,
                    &quot;가격이 알맞은 아파트를 찾았다&quot;라는 상황을 떠올리세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research References */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="text-orange-500" size={24} />
          참고 연구
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <span>
                <strong>Ebbinghaus, H. (1885).</strong> Memory: A Contribution to Experimental Psychology.
                - 망각 곡선의 최초 발견
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <span>
                <strong>Karpicke, J. D., & Roediger, H. L. (2008).</strong> The Critical Importance of Retrieval for Learning.
                - 능동적 회상(테스트 효과)의 학습 효과 입증
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <span>
                <strong>Cepeda, N. J., et al. (2006).</strong> Distributed Practice in Verbal Recall Tasks.
                - 분산 학습의 효과에 대한 메타 분석
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <span>
                <strong>Bjork, R. A. (1994).</strong> Memory and Metamemory Considerations in the Training of Human Beings.
                - 바람직한 어려움(Desirable Difficulty) 개념 제시
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold">•</span>
              <span>
                <strong>Ye, J. (2024).</strong> FSRS: A Modern Spaced Repetition Algorithm.
                - FSRS 알고리즘 개발 및 검증
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-center text-white">
        <h3 className="text-xl font-bold mb-2">지금 바로 시작하세요!</h3>
        <p className="mb-4 opacity-90">
          과학적으로 검증된 방법으로 TOEIC 어휘를 효율적으로 마스터하세요.
        </p>
        <a
          href="/study"
          className="inline-block px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          학습 시작하기
        </a>
      </div>
    </div>
  );
}
