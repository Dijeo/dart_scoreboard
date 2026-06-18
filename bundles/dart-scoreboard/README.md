# Darts Scoreboard (NodeCG Bundle)

Bu proje, canlı yayınlar ve turnuvalar için NodeCG üzerinde çalışan profesyonel bir 501 Dart Skorbordudur.

## Başka Makinede Kurulum (Production)

Bu bundle'ı başka bir bilgisayarda kullanabilmeniz için o bilgisayarda **Node.js** (v18 veya üstü) kurulu olmalıdır.

### Adım 1: NodeCG'yi Kurun
Hedef bilgisayarda komut satırında (Terminal/CMD) kurulum yapmak istediğiniz klasöre giderek aşağıdaki komutları çalıştırın:

```bash
git clone https://github.com/nodecg/nodecg.git
cd nodecg
npm install
npm run build
```

### Adım 2: Bu Bundle'ı Kopyalayın
Kurulum tamamlandığında oluşan `bundles` klasörünün içine, şu an bulunduğunuz `dart-scoreboard` klasörünü kopyalayın. Sonuç olarak dizin yapısı şöyle görünmelidir:
`C:\DartsBroadcast\bundles\dart-scoreboard`

### Adım 3: Bağımlılıkları Yükleyin ve Başlatın
Terminal'de `dart-scoreboard` klasörünün içine girmeseniz bile, NodeCG ana klasöründe şu komutu çalıştırarak yayını başlatabilirsiniz:

```bash
node index.js
```

### Adım 4: Kullanım
1. **Hakem Paneli (Dashboard):** Tarayıcınızda `http://localhost:9090` adresine gidin. Buradan skorları girebilir, set ve leg hedeflerini ayarlayabilir, isimleri değiştirebilirsiniz.
2. **Yayın Grafiği (OBS):** OBS (veya benzeri bir yayın programı) üzerinde yeni bir "Browser Source" (Tarayıcı Kaynağı) ekleyin.
3. OBS'deki URL kısmına: `http://localhost:9090/bundles/dart-scoreboard/graphics/overlay.html` adresini yapıştırın. Genişliği 1920, yüksekliği 1080 olarak ayarlayın.

---

## Özellikler
- **Gerçek Zamanlı İletişim:** Hakem panelinde girilen skorlar OBS'e gecikmesiz olarak yansır.
- **GSAP Animasyonları:**
  - 180 Atışlarında tam ekran 180 alev efekti.
  - Skor sayımlarında geri sayım (Countdown) efekti.
  - Bust (Batar) durumunda yanıp sönen kırmızı uyarı.
- **Undo Sistemi:** Yanlış girilen bir puanı "Undo Last Action" butonu ile saniyeler içinde geri alabilirsiniz (son 50 atışı hafızada tutar).
- **Otomatik Bitiş (Checkout) Önerileri:** Puan 170 veya altına düştüğünde oyuncuya nasıl bitebileceğini gösteren rota görünür hale gelir.
- **Set & Leg Mantığı:** Hedeflenen leg kazanıldığında set sayacı devreye girer. Skorlar otomatik yenilenir.
