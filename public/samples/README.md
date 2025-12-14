# NeuroTOEIC 덱 파일 양식

## 지원 형식

### 1. Cloze (빈칸 채우기) 형식 - `.md`

```markdown
# 덱 제목
tags: 태그1, 태그2, 태그3

---

문장에서 {{c1::정답::힌트}} 부분이 빈칸이 됩니다.
|trap: 오답1, 오답2, 오답3

She {{c1::agreed to meet::동의하다}} with the manager.
|trap: agreed meeting, agreed meet
```

- `{{c1::정답::힌트}}` - 빈칸으로 표시될 부분
  - `c1` - 빈칸 번호 (c1, c2, c3...)
  - `정답` - 실제 정답
  - `힌트` - 선택사항, 빈칸에 표시될 힌트
- `|trap:` - 선택사항, 객관식에서 보여줄 오답들 (쉼표로 구분)

### 2. Q&A 형식 - `.md` 또는 `.txt`

```markdown
# 덱 제목
tags: 태그1, 태그2

---

Q: 질문 내용
A: 정답 내용

Q: What is the capital of France?
A: Paris
```

### 3. 단순 텍스트 형식 - `.txt`

```
앞면 내용 | 뒷면 내용
contract | 계약
deadline | 마감일
```

또는 탭으로 구분:

```
앞면 내용	뒷면 내용
contract	계약
deadline	마감일
```

## 파일 예시

### toeic-verb-patterns.md (Cloze 형식)
```markdown
# TOEIC Verb Patterns
tags: grammar, verbs

---

The manager {{c1::agreed to meet::동의하다}} with the client.
|trap: agreed meeting, agreed meet, agreed on meet

She {{c1::suggested going::제안하다}} to the restaurant.
|trap: suggested to go, suggested go
```

### toeic-vocabulary.md (Q&A 형식)
```markdown
# TOEIC Vocabulary
tags: vocabulary

---

Q: A formal agreement between parties
A: contract (계약)

Q: The date by which something must be done
A: deadline (마감일)
```

## 팁

1. 첫 줄에 `# 제목`으로 덱 이름 지정
2. `tags:` 줄로 태그 추가 (선택사항)
3. `---` 구분선 이후에 카드 내용 작성
4. 빈 줄로 카드 구분
