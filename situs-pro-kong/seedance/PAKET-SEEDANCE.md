# Paket Seedance 2.5: video "Surat Sampai"

Dari PRD `docs/pro-kong/prd-venbeemail-pro-kong/SKILL.md` bagian 7. Lembar pratinjau semua bingkai: `bingkai/lembar-bingkai.jpg`.

## Cara pakai singkat

1. Buat klip **satu per satu**, urutan: **V0, V6, V1, V2, V4, V5, V3**, terakhir V3x (opsional).
2. Setiap selesai satu klip, unggah hasilnya ke `situs-pro-kong/video-mentah/` lewat GitHub web (cabang `claude/epic-carson-4jmsuo`), atau lampirkan ke chat. Claude memeriksa dulu (lolos, atau apa yang diubah di prompt) sebelum kamu lanjut ke klip berikutnya.
3. Beri tahu Claude penyedia yang kamu pakai (R12): BytePlus ModelArk, Volcengine, fal.ai, atau aplikasi Dreamina/Jimeng.

## Setelan yang sama untuk semua klip

| Setelan | Nilai |
|---|---|
| Model | Seedance 2.5. BytePlus: `dreamina-seedance-2-5-260628`. Volcengine: `doubao-seedance-2-5-260628`. fal.ai: `bytedance/seedance-2.5/image-to-video` (V3x: `bytedance/seedance-2.5/reference-to-video`). **Cocokkan dulu dengan nama di konsol** |
| Resolusi | `720p` |
| Rasio | Jangan dikirim (ikut gambar awal; semua bingkai tepat 1280x720) |
| Suara | **Mati** (`generate_audio: false`) |
| Tanda air | Mati (`watermark: false`) |
| `return_last_frame` | `true` kalau ada |
| Durasi | Sesuai tabel di bawah. Jangan di bawah 4 detik |
| Hemat | Boleh coba dulu sebagai draft 480p (`draft: true`), lalu render 720p dari draft yang terpilih |

Di aplikasi (Dreamina/Jimeng): pilih Seedance 2.5, mode **"first and last frame"** (gambar awal dan akhir), unggah dua bingkai, tempel prompt, 720p, durasi sesuai tabel, suara mati. Kalau durasi yang tersedia hanya tertentu (misalnya 5 atau 10 detik), pakai yang terdekat dan beri tahu Claude.

## Tabel klip

Tautan bingkai (repo publik, bisa dipakai langsung sebagai `image_url`, atau dibuka di HP lalu disimpan):
`https://raw.githubusercontent.com/rorobadojo-rgb/Venbeemail/claude/epic-carson-4jmsuo/situs-pro-kong/seedance/bingkai/<NAMA>.png`

| Urutan | No | Simpan dengan nama | Detik | Gambar awal | Gambar akhir | Seed | Percobaan |
|---|---|---|---|---|---|---|---|
| 1 | V0 | `vk-hero-loop.mp4` | 6 | `KH.png` | `KH.png` | 2510001 | 3 |
| 2 | V6 | `vk-ft-sorotan-loop.mp4` | 6 | `KF.png` | `KF.png` | 2510601 | 2 |
| 3 | V1 | `vk-f1-panggung-bangun.mp4` | 5 | `K0.png` | `K1.png` | 2510101 | 3 |
| 4 | V2 | `vk-f2-lepas-landas.mp4` | 5 | `K1.png` | `K2.png` | 2510201 | 3 |
| 5 | V4 | `vk-f4-di-udara.mp4` | 5 | `K4.png` | `K4b.png` | 2510401 | 3 |
| 6 | V5 | `vk-f5-menukik.mp4` | 7 | `K5.png` | `K6.png` | 2510501 | 4 |
| 7 | V3 | `vk-f3-bibir-podium.mp4` | 8 | `K3a.png` | `K3b.png` | 2510301 | 2 |
| 8 | V3x (opsional) | `vk-f3x-estafet-asli.mp4` | 6 | mode referensi: `ref-1.png` sampai `ref-6.png` | | 2510351 | 1 |

Perkiraan biaya (dari PRD 7.5, bisa berubah, cek harga di konsol): sekitar $27,5 di BytePlus untuk rencana 20 percobaan 720p, atau sekitar $22 kalau memakai draft 480p dulu.

## Contoh permintaan API (BytePlus ModelArk)

```json
POST https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks
{
  "model": "dreamina-seedance-2-5-260628",
  "content": [
    { "type": "text", "text": "<PROMPT KLIP DI BAWAH>" },
    { "type": "image_url", "role": "first_frame",
      "image_url": { "url": "https://raw.githubusercontent.com/rorobadojo-rgb/Venbeemail/claude/epic-carson-4jmsuo/situs-pro-kong/seedance/bingkai/K0.png" } },
    { "type": "image_url", "role": "last_frame",
      "image_url": { "url": "https://raw.githubusercontent.com/rorobadojo-rgb/Venbeemail/claude/epic-carson-4jmsuo/situs-pro-kong/seedance/bingkai/K1.png" } }
  ],
  "resolution": "720p",
  "duration": 5,
  "generate_audio": false,
  "watermark": false,
  "return_last_frame": true,
  "seed": 2510101
}
```

Nama field ini dari ringkasan dokumentasi, bukan dari halaman resmi langsung. Kalau konsol meminta bendera di dalam teks prompt (misalnya `--rs 720p --dur 5`), pakai cara itu dengan nilai yang sama.

## Prompt (salin persis)

### 1. V0 `vk-hero-loop.mp4` (6 detik, awal + akhir `KH.png`, seed 2510001)

```text
The first frame and the last frame are the same image. Handmade papercraft diorama: a blue felt envelope with white stitching and a white ghost patch floats above a round blue podium with white flower motifs and an orange rim, on a dark teal stage lit by one soft spotlight from above.
0-2 s: static wide shot, camera locked. The envelope drifts upward a few centimetres and tilts slightly to the right. Tiny paper dust motes float slowly through the spotlight beam.
2-4 s: the envelope turns gently about 10 degrees and tilts back. The spotlight shimmers softly. Dust keeps drifting.
4-6 s: the envelope drifts back down to exactly its starting position and angle. The motion slows smoothly into the first frame.
Keep the envelope, the ghost patch, the podium pattern, the colours and the framing exactly as in the image. Consistent paper and felt textures, soft cinematic lighting, smooth continuous seamless loop.
Avoid: camera movement, cuts, text, letters, logos, watermark, extra objects, characters, flicker, colour shift.
```

### 2. V6 `vk-ft-sorotan-loop.mp4` (6 detik, awal + akhir `KF.png`, seed 2510601)

```text
The first frame and the last frame are the same image. Empty papercraft stage: dark teal backdrop, a round blue podium with white flower motifs and an orange rim, no characters.
0-3 s: static wide shot, camera locked. The top spotlight sways slowly to the left and paper dust drifts through the beam.
3-6 s: the spotlight sways back to its starting position and the light settles exactly as in the first frame.
Seamless loop, smooth and slow.
Avoid: camera movement, characters, objects on the podium, text, letters, logos, watermark, flicker.
```

### 3. V1 `vk-f1-panggung-bangun.mp4` (5 detik, `K0.png` ke `K1.png`, seed 2510101)

```text
Papercraft diorama on a dark teal stage: a round blue podium with white flower motifs and an orange rim, and a blue felt envelope with a white ghost patch standing upright on the podium.
0-2 s: the stage is almost dark. Slow crane down from a high wide shot toward the podium.
2-4 s: soft spotlights switch on one after another from left to right and pools of light spread across the podium. The camera keeps descending and slowly pushes in.
4-5 s: medium shot of the envelope on the podium, fully lit. The ghost patch blinks once.
One continuous take, slow and steady camera, no cuts. Keep the envelope design and the podium pattern exactly as in the first image, and end exactly on the composition of the last image.
Avoid: text, letters, logos, watermark, new characters, people, fast motion, flicker.
```

### 4. V2 `vk-f2-lepas-landas.mp4` (5 detik, `K1.png` ke `K2.png`, seed 2510201)

```text
Same papercraft stage. A plain white folded paper plane swoops in, picks up the blue felt envelope and climbs.
0-1.5 s: medium shot. The paper plane enters from the left edge and slides under the envelope.
1.5-3.5 s: the plane and the envelope lift off together and spiral upward around the spotlight beam. The camera tilts up and follows them.
3.5-5 s: the envelope swings toward the lens and fills the whole frame, ending on the felt texture and the ghost patch as in the last image.
Smooth continuous camera, no cuts. The plane stays plain white paper. The envelope keeps its stitches and its ghost patch.
Avoid: text, letters, logos, watermark, extra planes, the plane turning into the envelope, any morphing, heavy motion blur in the final second.
```

### 5. V4 `vk-f4-di-udara.mp4` (5 detik, `K4.png` ke `K4b.png`, seed 2510401)

```text
A plain white paper plane carrying a blue felt envelope with a white ghost patch flies through a dark teal night sky dotted with small white paper flowers like stars.
0-2 s: medium shot. The plane glides forward toward the camera while small paper clouds drift past in the foreground.
2-4 s: the plane and the envelope do one slow 180-degree barrel roll together.
4-5 s: they come out of the roll larger and slightly to the right, matching the last image.
The camera follows smoothly in one continuous take.
Avoid: text, letters, logos, watermark, ground, buildings, extra planes, characters, morphing.
```

### 6. V5 `vk-f5-menukik.mp4` (7 detik, `K5.png` ke `K6.png`, seed 2510501)

```text
Papercraft diorama: on a round blue podium with white flower motifs on a dark teal stage stands a banana zombie mascot in an orange beanie and a patched denim jacket, holding a cardboard tube mailbox with a blue banana logo above its head.
0-3 s: high wide shot. The camera tilts down and dives toward the mascot.
3-6 s: the camera rises past the mascot's head to the mailbox and pushes in toward the dark mail slot.
6-7 s: close-up of the mail slot on the cardboard tube, as in the last image. A faint warm light glows inside the slot.
The mascot stays still in the same pose. Its face, eyes, tongue, colours and clothing stay exactly as in the first image. One continuous take, no cuts.
Avoid: changing the mascot's face, eyes or colours, extra limbs, new characters, text, letters, any logo other than the existing blue banana, watermark, cuts.
```

V5 paling ketat: kalau wajah, mata, lidah, atau warna maskot berubah sedikit saja, klip gagal dan dibuat ulang (aturan maskot tidak diubah).

### 7. V3 `vk-f3-bibir-podium.mp4` (8 detik, `K3a.png` ke `K3b.png`, seed 2510301)

```text
Empty papercraft stage with no characters. A low camera close to the floor glides along the orange rim of a giant round blue podium with white flower motifs, like a camera moving along the lip of a skate bowl.
0-3 s: low-angle tracking shot moving from left to right along the rim. One spotlight sweeps slowly across the podium surface.
3-6 s: the camera keeps the same height and the same speed. The curved rim stays in the lower third of the frame. Paper dust drifts through the light.
6-8 s: the camera slows down and settles on the composition of the last image.
Steady constant speed, no shake, no cuts. Keep the middle of the frame clear and evenly lit.
Avoid: people, animals, monkeys, envelopes, paper planes, any characters, text, letters, logos, watermark, fast motion.
```

### 8. V3x `vk-f3x-estafet-asli.mp4` (opsional, 6 detik, mode referensi, seed 2510351)

Unggah `ref-1.png` sampai `ref-6.png` berurutan sebagai @image1 sampai @image6.

```text
@image1 is the red-haired origami monkey on a skateboard, @image2 the blue-haired monkey with braids, @image3 the brown-haired monkey in a pinned denim vest, @image4 the blond monkey in a blue beanie, @image5 the blue felt envelope with a white ghost patch, @image6 the stage and podium. Use the images for identity only and ignore their backgrounds.
0-2 s: low tracking shot along the orange rim of the podium from @image6. @image1 skates in from the left holding @image5 and tosses it in an arc to @image2.
2-4 s: @image2 catches it, spins once, and tosses it to @image3, who almost drops it: the envelope tumbles and @image3 catches it at the last moment with one fingertip.
4-6 s: @image4 skates in fast and throws the envelope straight up out of the top of the frame.
Keep every monkey's face, hair, clothes, skateboard and colours exactly as in the reference images. Papercraft textures, one continuous take.
Avoid: text, letters, logos, watermark, extra characters, people, merged characters, changing costumes.
```

V3x dicoba sekali saja. Kalau satu monyet saja melenceng (wajah, rambut, baju, papan), V3x dibuang dan adegan 3 memakai V3 + potongan monyet + GSAP (rencana utama).

## Catatan perakitan bingkai

- Semua bingkai dibuat oleh `situs-pro-kong/alat/bingkai_kunci.py` dari aset asli, tanpa teks.
- K0: tepi bingkai yang diperkecil 0,9 diisi gradien dari warna panggung gelap itu sendiri (bukan `#001d25` murni), karena `#001d25` lebih terang dari panggung yang digelapkan 0,35 dan membuat kotak terlihat.
- K5: kaki maskot diletakkan di garis kaki yang sama dengan footer (y 605 di bingkai 1280x720, setara y 645 di latar 1376x768), dengan bibir podium ditempel di depan kaki. Angka y 630 di PRD 7.3 berada di dinding depan podium (di bawah pinggiran oranye y 616), sehingga maskot akan tampak melayang di depan podium.
- Kalau ada latar resolusi besar (R15), taruh di `seedance/sumber/latar-besar.png`. K3a dan K3b langsung memakainya; K1 dan K6 disesuaikan Claude saat berkas itu dikirim, lalu bingkai dirakit ulang.
