# One-off: append an extra "who it suits" paragraph to each category landing so every page has >= 300 words of unique prose (TZ).
import json, re, io

P = "src/_data/categories.json"
extra = {
    "maika": {
        "ru": "<h2>Кому подходит</h2><p>Продуктовым магазинам и сетям — как основной пакет на кассе. Аптекам — компактный формат под лекарства и мелкие покупки. Рынкам и лавкам — прозрачная майка без печати или с одноцветным логотипом. Магазинам одежды среднего сегмента — белая майка с логотипом как недорогая альтернатива ПВД. Если сомневаетесь между майкой и пакетом с вырубной ручкой, посчитайте оба варианта в калькуляторе: разница в цене за штуку покажет, стоит ли переплачивать за плотную плёнку.</p>",
        "uz": "<h2>Kimga mos</h2><p>Oziq-ovqat do'konlari va tarmoqlariga — kassadagi asosiy paket sifatida. Dorixonalarga — dori va mayda xaridlar uchun ixcham format. Bozor va do'konchalarga — bosmasiz yoki bir rangli logotipli shaffof mayka. O'rta segmentdagi kiyim do'konlariga — PVD ga arzon muqobil sifatida logotipli oq mayka. Mayka va kesilgan dastali paket o'rtasida ikkilansangiz, ikkala variantni kalkulyatorda hisoblang: dona narxidagi farq zich plyonka uchun ortiqcha to'lashga arziydimi yoki yo'qligini ko'rsatadi.</p>",
    },
    "pvd": {
        "ru": "<h2>Кому подходит</h2><p>Магазинам одежды и обуви, салонам, ювелирным и косметическим брендам — пакет здесь часть покупки. Клиникам и аптекам — белый пакет с логотипом в один-два цвета. Кондитерским и пекарням премиум-сегмента — плотный пакет под коробку с тортом. Интернет-магазинам и службам доставки — курьерский формат с клапаном. Для каждой задачи в калькуляторе можно сравнить толщину и цветность и увидеть, как меняется цена за штуку и вес партии.</p>",
        "uz": "<h2>Kimga mos</h2><p>Kiyim va poyabzal do'konlari, salonlar, zargarlik va kosmetika brendlariga — bu yerda paket xaridning bir qismi. Klinika va dorixonalarga — bir-ikki rangli logotipli oq paket. Premium segmentdagi qandolatxona va nonvoyxonalarga — tort qutisi uchun zich paket. Internet-do'konlar va yetkazib berish xizmatlariga — klapanli kuryer format. Har bir vazifa uchun kalkulyatorda qalinlik va ranglilikni solishtirib, dona narxi va partiya og'irligi qanday o'zgarishini ko'rish mumkin.</p>",
    },
    "stretch-hood": {
        "ru": "<h2>Что подготовить перед заказом</h2><p>Размер паллета и высоту штабеля, вес груза, модель и настройки упаковочной машины, требования к прозрачности и защите от ультрафиолета, если паллеты хранятся на открытой площадке. Полезно приложить фото текущей упаковки: по нему технолог быстрее подберёт ширину рукава и толщину. Если линии стрейч-худ у вас ещё нет, напишите нам — расскажем, при каких объёмах отгрузки переход с обмотки на чехол окупается.</p>",
        "uz": "<h2>Buyurtmadan oldin nimani tayyorlash</h2><p>Pallet o'lchami va shtabel balandligi, yuk og'irligi, qadoqlash mashinasi modeli va sozlamalari, agar palletlar ochiq maydonda saqlansa — shaffoflik va ultrabinafshadan himoya talablari. Hozirgi qadoq fotosini ilova qilish foydali: u bo'yicha texnolog yeng eni va qalinligini tezroq tanlaydi. Agar streych-xud liniyangiz hali bo'lmasa, bizga yozing — o'rashdan g'ilofga o'tish qanday jo'natma hajmida o'zini oqlashini aytamiz.</p>",
    },
    "food": {
        "ru": "<h2>Кому подходит</h2><p>Пекарням и производителям лепёшек — рулонные пакеты с логотипом под хлеб. Продуктовым сетям и рынкам — фасовочные пакеты в отделы овощей, круп и заморозки. Кондитерским — тонкие прозрачные пакеты под выпечку. Производствам полуфабрикатов — пакеты под вес и температуру продукта. Посчитайте в калькуляторе размер под ваш продукт и толщину под его вес: калькулятор покажет, сколько штук входит в минимальный заказ 200 кг и сколько это стоит за штуку.</p>",
        "uz": "<h2>Kimga mos</h2><p>Nonvoyxona va patir ishlab chiqaruvchilarga — non uchun logotipli rulonli paketlar. Oziq-ovqat tarmoqlari va bozorlarga — sabzavot, yorma va muzlatilgan mahsulotlar bo'limlari uchun fasovka paketlar. Qandolatxonalarga — pishiriq uchun yupqa shaffof paketlar. Yarim tayyor mahsulot ishlab chiqarishlarga — mahsulot og'irligi va haroratiga mos paketlar. Kalkulyatorda mahsulotingizga o'lcham va og'irligiga qalinlikni hisoblang: kalkulyator 200 kg minimal buyurtmaga necha dona kirishini va dona narxi qanchaligini ko'rsatadi.</p>",
    },
    "stretch": {
        "ru": "<h2>Как заказать</h2><p>Для стрейч-плёнки укажите ширину рулона, толщину и способ намотки — ручной или машинный; для мешков — размер, толщину, материал и цвет. Пришлите объём в месяц, если планируете регулярные поставки: под постоянные отгрузки фиксируем спецификацию и цену в договоре, а повторный заказ занимает минуту. Самовывоз со склада в Учтепинском районе Ташкента или доставка по Узбекистану — стоимость доставки считает менеджер при оформлении.</p>",
        "uz": "<h2>Qanday buyurtma berish</h2><p>Streych plyonka uchun rulon eni, qalinligi va o'rash usulini — qo'l yoki mashina — ko'rsating; qoplar uchun — o'lcham, qalinlik, material va rang. Muntazam yetkazib berishni rejalashtirsangiz, oylik hajmni yuboring: doimiy jo'natmalar uchun spetsifikatsiya va narxni shartnomada mahkamlaymiz, qayta buyurtma esa bir daqiqa oladi. Toshkent Uchtepa tumanidagi ombordan olib ketish yoki O'zbekiston bo'ylab yetkazib berish — yetkazib berish narxini rasmiylashtirishda menejer hisoblaydi.</p>",
    },
}
data = json.load(io.open(P, encoding="utf-8"))
for it in data["items"]:
    ex = extra.get(it["slug"])
    if not ex:
        continue
    for l in ("ru", "uz"):
        if ex[l] not in it["body"][l]:
            it["body"][l] += ex[l]
io.open(P, "w", encoding="utf-8", newline="\n").write(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
for it in data["items"]:
    for l in ("ru", "uz"):
        print(it["slug"], l, len(re.sub("<[^>]+>", " ", it["body"][l]).split()))
