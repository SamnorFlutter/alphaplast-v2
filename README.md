# Alpha Plast v2 — сайт по ТЗ от 21.09.2026 (этап 1, статический фронт)

Демо-версия нового многостраничного сайта Alpha Plast в концепции **Liquid Glass**. Старый сайт (`alphaplast-site`) не тронут — версии можно сравнивать рядом.

- Живая демо-версия: https://samnorflutter.github.io/alphaplast-v2/ (RU) · https://samnorflutter.github.io/alphaplast-v2/uz/
- Старый сайт: https://samnorflutter.github.io/alphaplast-site/

## Что реализовано из ТЗ (этап 1)

| Раздел ТЗ | Статус | Где |
|---|---|---|
| Карта сайта: главная, каталог, 5 посадочных, карточки товаров, бестселлеры, калькулятор, портфолио, клиенты, производство, доставка/оплата, контакты, визитка, блог | ✅ | `src/pages/*`, `src/posts/*` |
| Языки RU/UZ, `/ru/…` и `/uz/…`, корень → `/ru/`, переключатель на ту же страницу, hreflang + x-default, canonical | ✅ | `base.njk`, `index.njk` |
| Ротация 20+ заголовков: JSON, перемешивание + индекс в sessionStorage, min-height по самой длинной фразе (grid-стек), первая фраза в HTML, неподтверждённые фразы исключены | ✅ | `phrases.json`, `home.njk` |
| Селектор ниши: показывается только при ≥3 клиентах, «Моей ниши нет», запоминание и предвыбор в фильтре, событие в аналитику и поле в лиде | ✅ | `niches.json`, `app.js` |
| Каталог с фильтром (применение, тип, нагрузка, тираж+вес, печать, пищевой допуск), состояние в URL, пустая выдача → ближайшие позиции, мобильная панель со счётчиком | ✅ | `catalog.njk`, `app.js` |
| Карточка товара: галерея реальных фото, таблица размеров/толщин с весом и мин. тиражом, цены по тиражам, печать, форма заказа в середине страницы, Product JSON-LD | ✅ | `product.njk` |
| Бестселлеры с точной ценой и «Хочу такой» (поля редактируемые, при отклонении от бестселлера — диапазон) | ✅ | `bestsellers.json`, `calc.njk` |
| Калькулятор: минимум 200 кг до ввода, вес по размеру/толщине/плотности, ползунок от минимума, «довести до минимума», точная цена / диапазон, НДС отдельной строкой, тип клиента, логирование расчёта (dataLayer) | ✅ демо | `calc-engine.js`, `pricing.json` |
| AI-readable: SSR-текст, семантика, таблицы тегом `table`, alt у фото, `llms.txt`, открытый `api/catalog.json`, robots без блокировки GPTBot/ClaudeBot/PerplexityBot/YandexBot | ✅ | `llms.njk`, `api-catalog.njk`, `robots.njk` |
| Schema.org: Organization, LocalBusiness, WebSite, Product, FAQPage, Article, BreadcrumbList | ✅ | `base.njk`, страницы |
| Страница-визитка `/links`: noindex, tel:/mailto:, соцсети, три карты, «Сохранить контакт» (vCard), реквизиты, события с UTM | ✅ | `links.njk`, `vcard.njk` |
| UTM: cookie 90 дней, первый и последний источник, страница входа и referrer в лиде; короткие редиректы `/go/yandex`, `/go/2gis`, `/go/google`, `/go/ig`, `/go/tg`, `/go/yt` | ✅ | `app.js`, `go.njk` |
| События аналитики: `view_product`, `calculate`, `lead_submit`, `checkout_start`, `niche_select`, `phone_click`, `tg_click`, `want_this` → dataLayer (GTM подключается через `cfg.gtm_id`) | ✅ | `app.js` |
| Скорость: шрифт локально (Manrope, 2 subset-файла ~40 КБ, `font-display: swap`), lazy-load, YouTube/карта по клику, без тяжёлых библиотек | ✅ | |
| Политика и оферта RU/UZ (типовые, нужен юрист) | ✅ | `legal.json` |

## Что требует бэкенда (ahost, PHP 8 + MariaDB) и НЕ реализуемо на GitHub Pages

- Расчёт цены **на сервере** и скрытие коэффициентов — сейчас демо-расчёт в браузере (`calc-engine.js` написан так, чтобы 1:1 перенести на сервер; коэффициенты — `pricing.json`).
- Лиды в Odoo, круговая очередь менеджеров, таймеры 5 минут, дублирование в Telegram-канал — сейчас заявка уходит на почту (Web3Forms) и в Telegram-бот из браузера.
- Вход через Telegram-бот (токены, вебхуки), личный кабинет, Mini App.
- Онлайн-оплата Rahmat, фискализация, `/checkout`, `/order/<id>` — этап 2.
- Проверка ИНН, AIBA, код договора — этап 3. Визуализатор макета — этап 3–4.
- Админка (Pages CMS можно подключить к JSON-файлам в `src/_data` как на старом сайте).

## Что нужно от заказчика перед снятием пометки «демо»

1. Список бестселлеров с утверждёнными ценами (`src/_data/bestsellers.json`).
2. Коэффициенты калькулятора от технолога (`src/_data/pricing.json`) и типовые размеры/толщины (`products.json`).
3. Ставка НДС по типам клиентов (сейчас 12% для всех).
4. Реквизиты: ИНН, р/с, банк (`company.json`), образец договора в PDF.
5. Логотипы клиентов и письменные согласия; отзывы с инициалами и должностью.
6. Сканы сертификатов на пищевую упаковку.
7. Спанбонд: по словам заказчика (июнь 2026) эко-сумки не производятся — категория исключена; подтвердить.
8. Фразы ротации с обещаниями (сроки, отсрочка, гарантия) — сейчас `confirmed: false`, не показываются.
9. GTM / GA4 / Метрика id → `cfg.json`.

## Разработка

```bash
npm install
npm run serve          # http://localhost:8087/ (без префикса)
npm run build:pages    # сборка для GitHub Pages (префикс /alphaplast-v2/)
```

Секреты (`WEB3FORMS_KEY`, `TG_BOT_TOKEN`, `TG_CHAT_ID`) берутся из переменных окружения или локального `.env` (в репозиторий не попадает); в GitHub Actions — из Secrets репозитория.

## Структура

```
src/_data/      cfg, company, t (UI RU/UZ), phrases, categories, products, bestsellers, pricing, portfolio, clients, niches, applications, pages, legal
src/_includes/  base.njk (макет), post.njk, partials/ (calc, lead-form, product-card, bestseller-card, breadcrumbs, icons)
src/pages/      все страницы (пагинация по языкам)
src/posts/      статьи блога *.ru.md / *.uz.md
src/lib/        calc-engine.js (общий для Node и браузера)
src/assets/     style.css (Liquid Glass, тёмная/светлая тема), app.js, шрифты, фото
```
