# radix24.github.io

조현서의 개인 소개 사이트입니다. 빌드 없이 `index.html`, `style.css`, `main.js`만으로 동작합니다.

## 배포

1. GitHub에 `radix24.github.io` 저장소를 만들고 이 폴더의 파일을 올립니다.
2. Settings → Pages → Source를 `Deploy from a branch`, `main` / `(root)`로 둡니다.

## 고치기

- 사교육 경력(출제조교)은 `index.html`의 `<!-- [사교육 경력] -->` 주석 사이 `<li>` 하나입니다. 빼려면 그 줄들을 지웁니다.
- 스크롤에 따라 바뀌는 고도 표시는 각 `<section>`의 `data-alt`(km)와 `data-zone` 값을 씁니다.
