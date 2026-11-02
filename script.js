/* ==========================================================================
   WAT ARUN 3D — Virtual Riverside Sanctuary & Walkthrough Studio
   Vanilla ES6 + Three.js r128 (CDN). All geometry, textures and audio are
   generated procedurally in the browser. No external model or image assets.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* 0. Small utilities                                                  */
  /* ------------------------------------------------------------------ */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
  const rad = (d) => (d * Math.PI) / 180;
  const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const IS_TOUCH = matchMedia('(pointer: coarse)').matches;

  const PARAMS = new URLSearchParams(location.search);
  const SHOT = PARAMS.get('shot') === '1';
  const SELFTEST = PARAMS.get('selftest') === '1';

  /* ------------------------------------------------------------------ */
  /* 1. Bilingual dictionary                                             */
  /* ------------------------------------------------------------------ */
  const I18N = {
    en: {
      'loader.sub': 'Temple of Dawn · Bangkok',
      'loader.building': 'Building the riverside sanctuary…',
      'loader.materials': 'Mixing porcelain and gold leaf…',
      'loader.gardens': 'Planting frangipani and salas…',
      'loader.ready': 'Sanctuary ready',
      'intro.kicker': 'Virtual Riverside Sanctuary & Walkthrough Studio',
      'intro.lede': 'Step onto the stone pier where the Chao Phraya meets the Temple of Dawn. Climb the terraces of the central Phra Prang, meet the yaksha guardians, and read the porcelain mosaics that shimmer in the river light.',
      'intro.f1t': 'Walk & Fly',
      'intro.f1d': 'First-person courtyard walk or full drone orbit',
      'intro.f2t': 'Five Hotspots',
      'intro.f2d': 'Bilingual history, lore and narration',
      'intro.f3t': 'Three Skies',
      'intro.f3d': 'Golden dawn, sunset glow, night illumination',
      'intro.begin': 'Enter the Sanctuary',
      'intro.beginSub': 'Click to walk · mouse look · WASD',
      'intro.beginOrbit': 'Drone flyover instead',
      'intro.note': 'Headphones recommended · progress is saved on this device',
      'intro.credit': 'Built with OpenCode & DeepSeek V4.1 Flash · Three.js',
      'brand.sub': 'Riverside Sanctuary',
      'preset.dawn': 'Golden Dawn',
      'preset.sunset': 'Sunset Glow',
      'preset.night': 'Night Illumination',
      'mode.walk': 'Walk',
      'mode.orbit': 'Drone',
      'mode.walkValue': 'First-person',
      'mode.orbitValue': 'Drone orbit',
      'panel.hotspots': 'Sanctuary Hotspots',
      'stat.preset': 'Sky',
      'stat.mode': 'Mode',
      'map.prang': 'Prang',
      'map.hall': 'Ubosot',
      'map.river': 'River',
      'zone.prang': 'Phra Prang Courtyard',
      'zone.prangHint': 'Three galleries circle the Mount Meru spire',
      'zone.ubosot': 'Ubosot & Yaksha Gate',
      'zone.ubosotHint': 'Thotsakan and Sahassa Deja guard the ordination hall',
      'zone.promenade': 'Chao Phraya Promenade',
      'zone.promenadeHint': 'Six granite salas face the river landing',
      'zone.terrace': 'Ceremonial Terrace',
      'zone.terraceHint': 'Satellite prangs and mondops ring the central tower',
      'zone.river': 'River Landing',
      'zone.riverHint': 'Long-tail boats drift on the Chao Phraya',
      'hint.move': 'move',
      'hint.sprint': 'sprint',
      'hint.jump': 'jump',
      'hint.interact': 'inspect',
      'hint.map': 'map',
      'hint.inspectNearby': 'Inspect hotspot',
      'hint.pressToRead': 'Press E to read',
      'modal.visited': 'Visited',
      'modal.index': 'Hotspot',
      'modal.narrate': 'Play narration',
      'modal.stop': 'Stop',
      'modal.bookmark': 'Bookmark a photo',
      'modal.next': 'Next hotspot →',
      'modal.statusNarrating': 'Narrating in English…',
      'modal.statusNoVoice': 'No English voice found — showing the text instead.',
      'help.eyebrow': 'Field guide',
      'help.title': 'Walking the sanctuary',
      'help.walkTitle': 'First-person walk',
      'help.walk1': 'Walk; hold Shift to sprint',
      'help.walk2': 'Jump; steps and ramps are walkable',
      'help.walk3': 'Look around while pointer is locked',
      'help.walk4': 'Read the nearest hotspot',
      'help.walk5': 'Release the pointer',
      'help.orbitTitle': 'Drone flyover',
      'help.orbit1': 'Orbit the whole complex',
      'help.orbit2': 'Zoom from river level to the finial',
      'help.orbit3': 'Pan the target',
      'help.orbit4': 'Drone view preset over the river',
      'help.drag': 'Drag',
      'help.wheel': 'Wheel',
      'help.rightDrag': 'Right-drag',
      'help.audioTitle': 'Sound & language',
      'help.audio1': 'River, chimes and footsteps are synthesised live with Web Audio',
      'help.audio2': "Narration uses your device's English or Thai voice",
      'help.audio3': 'EN / ไทย switches every label and description',
      'help.journalTitle': 'Tour journal',
      'help.journal1': 'Visits and photo bookmarks autosave to this browser',
      'help.journal2': 'Save exports watarun_3d_journal.json',
      'help.journal3': 'Load restores a journal on any device',
      'help.credit': 'Wat Arun 3D · an educational homage built with OpenCode and DeepSeek V4.1 Flash. Not affiliated with Wat Arun Ratchawararam.',
      'gallery.eyebrow': 'Photo journal',
      'gallery.title': 'Bookmarked views',
      'gallery.empty': 'No photos yet. Press the camera button or use “Bookmark a photo” inside a hotspot.',
      'gallery.remove': 'Remove photo',
      'journal.save': 'Save tour journal',
      'journal.load': 'Load journal',
      'toast.saved': 'Tour journal saved to this browser',
      'toast.exported': 'Journal exported as watarun_3d_journal.json',
      'toast.loaded': 'Journal restored — welcome back',
      'toast.loadFail': 'That file is not a Wat Arun 3D journal',
      'toast.photoSaved': 'Photo bookmarked in your journal',
      'toast.photoFail': 'Could not capture the view — try again',
      'toast.photoLimit': 'Photo journal is full — the oldest shot was replaced',
      'toast.muted': 'Sound off',
      'toast.unmuted': 'Sound on',
      'toast.lang': 'Language: English',
      'toast.langThai': 'ภาษาไทย',
      'toast.presetDawn': 'Golden dawn over the Chao Phraya',
      'toast.presetSunset': 'Sunset glow — long shadows on the terrace',
      'toast.presetNight': 'Night illumination — the prang lit in gold',
      'toast.modeWalk': 'First-person walk — mouse look, WASD to move',
      'toast.modeOrbit': 'Drone orbit — drag to circle, wheel to zoom',
      'toast.needLock': 'Click the scene to capture the mouse',
      'toast.outOfBounds': 'The river edge is closed beyond the landing',
      'toast.narrationUnsupported': 'Narration is not available in this browser',
      'toast.noPhotos': 'No bookmarked photos yet',
      'toast.photoDeleted': 'Photo removed',
      'toast.reset': 'View reset',
      'photo.noHotspot': 'Riverside view',
      'audio.on': 'Sound',
      'audio.off': 'Muted'
    },
    th: {
      'loader.sub': 'วัดอรุณ · กรุงเทพมหานคร',
      'loader.building': 'กำลังสร้างศาสนสถานริมน้ำ…',
      'loader.materials': 'กำลังผสมกระเบื้องเคลือบและทองคำเปลว…',
      'loader.gardens': 'กำลังปลูกเล็บมือนางและสร้างศาลา…',
      'loader.ready': 'ศาสนสถานพร้อมแล้ว',
      'intro.kicker': 'พิพิธภัณฑ์เสมือนจริงริมแม่น้ำและสตูดิโอเดินชม',
      'intro.lede': 'ก้าวขึ้นท่าหินที่แม่น้ำเจ้าพระยาบรรจบกับวัดอรุณ ไต่ระเบียงของพระปรางค์ประธาน พบทวารบาลยักษ์ และอ่านลวดลายกระเบื้องเคลือบที่เปล่งประกายในแสงน้ำ',
      'intro.f1t': 'เดินและบิน',
      'intro.f1d': 'เดินชมแบบบุคคลที่หนึ่ง หรือบังคับโดรนรอบองค์พระปรางค์',
      'intro.f2t': 'ห้าจุดเรียนรู้',
      'intro.f2d': 'ประวัติศาสตร์ ตำนาน และเสียงบรรยายสองภาษา',
      'intro.f3t': 'สามท้องฟ้า',
      'intro.f3d': 'อรุโณทัย ยามอัสดง และไฟประดับยามค่ำ',
      'intro.begin': 'เข้าสู่ศาสนสถาน',
      'intro.beginSub': 'คลิกเพื่อเดิน · มองด้วยเมาส์ · WASD',
      'intro.beginOrbit': 'ชมด้วยโดรนแทน',
      'intro.note': 'แนะนำให้ใส่หูฟัง · ความคืบหน้าบันทึกในอุปกรณ์นี้',
      'intro.credit': 'สร้างด้วย OpenCode และ DeepSeek V4.1 Flash · Three.js',
      'brand.sub': 'ศาสนสถานริมน้ำ',
      'preset.dawn': 'อรุโณทัย',
      'preset.sunset': 'อัสดง',
      'preset.night': 'วิจิตรเจ้าพระยา',
      'mode.walk': 'เดิน',
      'mode.orbit': 'โดรน',
      'mode.walkValue': 'บุคคลที่หนึ่ง',
      'mode.orbitValue': 'โดรนโคจร',
      'panel.hotspots': 'จุดเรียนรู้ในศาสนสถาน',
      'stat.preset': 'ท้องฟ้า',
      'stat.mode': 'โหมด',
      'map.prang': 'พระปรางค์',
      'map.hall': 'อุโบสถ',
      'map.river': 'แม่น้ำ',
      'zone.prang': 'ลานพระปรางค์ประธาน',
      'zone.prangHint': 'ระเบียงสามชั้นล้อมรอบยอดเขาพระสุเมรุ',
      'zone.ubosot': 'อุโบสถและประตูยักษ์',
      'zone.ubosotHint': 'ทศกัณฐ์และสหัสเดชะเฝ้าอุโบสถ',
      'zone.promenade': 'ลานริมแม่น้ำเจ้าพระยา',
      'zone.promenadeHint': 'ศาลาหินแกรนิตหกหลังหันหน้าสู่ท่าเรือ',
      'zone.terrace': 'ลานพิธี',
      'zone.terraceHint': 'พระปรางค์บริวารและมณฑปแวดล้อมองค์ประธาน',
      'zone.river': 'ท่าเรือ',
      'zone.riverHint': 'เรือหางยาวแล่นผ่านแม่น้ำเจ้าพระยา',
      'hint.move': 'เดิน',
      'hint.sprint': 'วิ่ง',
      'hint.jump': 'กระโดด',
      'hint.interact': 'ตรวจดู',
      'hint.map': 'แผนที่',
      'hint.inspectNearby': 'ตรวจดูจุดเรียนรู้',
      'hint.pressToRead': 'กด E เพื่ออ่าน',
      'modal.visited': 'เยี่ยมชมแล้ว',
      'modal.index': 'จุดเรียนรู้',
      'modal.narrate': 'ฟังเสียงบรรยาย',
      'modal.stop': 'หยุด',
      'modal.bookmark': 'บันทึกภาพ',
      'modal.next': 'จุดถัดไป →',
      'modal.statusNarrating': 'กำลังบรรยายเป็นภาษาไทย…',
      'modal.statusNoVoice': 'ไม่พบเสียงภาษาไทย — แสดงข้อความแทน',
      'help.eyebrow': 'คู่มือภาคสนาม',
      'help.title': 'การเดินชมศาสนสถาน',
      'help.walkTitle': 'เดินชมบุคคลที่หนึ่ง',
      'help.walk1': 'เดิน กด Shift ค้างเพื่อวิ่ง',
      'help.walk2': 'กระโดด บันไดและทางลาดเดินได้',
      'help.walk3': 'มองรอบตัวเมื่อเมาส์ถูกล็อก',
      'help.walk4': 'อ่านจุดเรียนรู้ที่ใกล้ที่สุด',
      'help.walk5': 'ปลดล็อกเมาส์',
      'help.orbitTitle': 'บินชมด้วยโดรน',
      'help.orbit1': 'หมุนรอบศาสนสถานทั้งหลัง',
      'help.orbit2': 'ซูมจากระดับแม่น้ำถึงยอดพระปรางค์',
      'help.orbit3': 'เลื่อนจุดหมาย',
      'help.orbit4': 'มุมโดรนเหนือแม่น้ำ',
      'help.drag': 'ลาก',
      'help.wheel': 'ล้อเมาส์',
      'help.rightDrag': 'ลากขวา',
      'help.audioTitle': 'เสียงและภาษา',
      'help.audio1': 'เสียงน้ำ ระฆังลม และฝีเท้าสังเคราะห์สดด้วย Web Audio',
      'help.audio2': 'เสียงบรรยายใช้เสียงอังกฤษหรือไทยของอุปกรณ์',
      'help.audio3': 'EN / ไทย สลับทุกป้ายและคำอธิบาย',
      'help.journalTitle': 'สมุดบันทึกการท่องเที่ยว',
      'help.journal1': 'การเยี่ยมชมและภาพที่บันทึกจะถูกเก็บในเบราว์เซอร์นี้',
      'help.journal2': 'บันทึกเป็นไฟล์ watarun_3d_journal.json',
      'help.journal3': 'โหลดเพื่อกู้คืนสมุดบันทึกบนอุปกรณ์อื่น',
      'help.credit': 'วัดอรุณ 3D · งานศึกษาเพื่อการเรียนรู้ สร้างด้วย OpenCode และ DeepSeek V4.1 Flash ไม่ได้สังกัดวัดอรุณราชวราราม',
      'gallery.eyebrow': 'สมุดภาพ',
      'gallery.title': 'ภาพที่บันทึกไว้',
      'gallery.empty': 'ยังไม่มีภาพ กดปุ่มกล้อง หรือใช้ “บันทึกภาพ” ในจุดเรียนรู้',
      'gallery.remove': 'ลบภาพ',
      'journal.save': 'บันทึกสมุดท่องเที่ยว',
      'journal.load': 'โหลดสมุดบันทึก',
      'toast.saved': 'บันทึกสมุดบันทึกในเบราว์เซอร์แล้ว',
      'toast.exported': 'ส่งออกสมุดบันทึกเป็น watarun_3d_journal.json',
      'toast.loaded': 'กู้คืนสมุดบันทึกแล้ว — ยินดีต้อนรับกลับ',
      'toast.loadFail': 'ไฟล์นี้ไม่ใช่สมุดบันทึกของวัดอรุณ 3D',
      'toast.photoSaved': 'บันทึกภาพลงสมุดบันทึกแล้ว',
      'toast.photoFail': 'จับภาพไม่สำเร็จ — กรุณาลองอีกครั้ง',
      'toast.photoLimit': 'สมุดภาพเต็ม — แทนที่ภาพเก่าที่สุด',
      'toast.muted': 'ปิดเสียง',
      'toast.unmuted': 'เปิดเสียง',
      'toast.lang': 'English',
      'toast.langThai': 'ภาษาไทย',
      'toast.presetDawn': 'อรุโณทัยเหนือแม่น้ำเจ้าพระยา',
      'toast.presetSunset': 'ยามอัสดง — เงายาวบนลาน',
      'toast.presetNight': 'ไฟประดับยามค่ำ — พระปรางค์ส่องทอง',
      'toast.modeWalk': 'เดินบุคคลที่หนึ่ง — มองด้วยเมาส์ WASD เพื่อเดิน',
      'toast.modeOrbit': 'โดรนโคจร — ลากเพื่อหมุน ล้อเพื่อซูม',
      'toast.needLock': 'คลิกฉากเพื่อจับเมาส์',
      'toast.outOfBounds': 'ขอบแม่น้ำปิดเกินท่าเรือ',
      'toast.narrationUnsupported': 'เบราว์เซอร์นี้ไม่รองรับเสียงบรรยาย',
      'toast.noPhotos': 'ยังไม่มีภาพที่บันทึก',
      'toast.photoDeleted': 'ลบภาพแล้ว',
      'toast.reset': 'คืนมุมมองแล้ว',
      'photo.noHotspot': 'ทิวทัศน์ริมแม่น้ำ',
      'audio.on': 'เสียง',
      'audio.off': 'ปิดเสียง'
    }
  };

  let LANG = 'en';
  const t = (k) => (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;

  /* ------------------------------------------------------------------ */
  /* 2. Hotspot content                                                  */
  /* ------------------------------------------------------------------ */
  const HOTSPOTS = [
    {
      id: 'prang', num: '01', icon: '◈', accent: '#e8bd63',
      pos: [17.6, 7.2, 0], radius: 12, auto: true, zone: 'prang',
      en: {
        eyebrow: 'Phra Prang · Axis of the Cosmos',
        title: 'Central Prang & Mount Meru Cosmology',
        thaiTitle: 'พระปรางค์ประธานกับจักรวาลวิทยาเขาพระสุเมรุ',
        body: [
          'The great prang is a stone diagram of the Buddhist universe. Its square base is the world of desire, its three steep terraces climb through the realms of form, and the gilded spire dissolves into the formless heaven above Mount Meru.',
          'Begun in the reign of King Rama II and completed under Rama III, the tower rises about 79 metres above the river. Its surface is white stucco encrusted with Chinese porcelain — more than a million pieces were re-set during the restoration completed in 2017.',
          'The stairways on all four faces are deliberately steep. Pilgrims climbed slowly, and the climb itself became part of the offering.'
        ],
        quote: 'The temple is not a picture of the cosmos — it is the cosmos, walked.',
        narrate: 'The central prang of Wat Arun is a stone diagram of the Buddhist universe. Its square base is the world of desire. Its three steep terraces climb through the realms of form. Its gilded spire dissolves into the formless heaven above Mount Meru. Begun under King Rama the Second and completed under Rama the Third, the tower rises about seventy nine metres above the river, faced in white stucco and encrusted with more than a million pieces of Chinese porcelain. The stairways are deliberately steep: pilgrims climbed slowly, and the climb itself became the offering.'
      },
      th: {
        eyebrow: 'พระปรางค์ประธาน · แกนแห่งจักรวาล',
        title: 'พระปรางค์ประธานกับจักรวาลวิทยาเขาพระสุเมรุ',
        thaiTitle: 'พระปรางค์ประธานกับจักรวาลวิทยาเขาพระสุเมรุ',
        body: [
          'พระปรางค์องค์ใหญ่คือแผนผังของจักรวาลในคติพุทธศาสนา ฐานสี่เหลี่ยมแทนกามภูมิ ระเบียงสามชั้นที่สูงชันแทนรูปภูมิ และยอดทองที่แหลมสูงแทนอรูปภูมิเหนือเขาพระสุเมรุ',
          'เริ่มสร้างในรัชกาลพระบาทสมเด็จพระพุทธเลิศหล้านภาลัย และแล้วเสร็จในรัชกาลพระบาทสมเด็จพระนั่งเกล้าเจ้าอยู่หัว องค์พระปรางค์สูงราว 79 เมตรจากระดับน้ำ ผิวฉาบปูนขาวประดับกระเบื้องเคลือบจีนกว่าล้านชิ้น ซึ่งได้รับการบูรณะครั้งใหญ่แล้วเสร็จในปี พ.ศ. 2560',
          'บันไดทั้งสี่ด้านชันโดยตั้งใจ ผู้แสวงบุญไต่ขึ้นอย่างช้า ๆ การขึ้นบันไดนั้นเองคือส่วนหนึ่งของการถวายบูชา'
        ],
        quote: 'วัดไม่ใช่ภาพแทนจักรวาล — วัดคือจักรวาลที่เดินได้',
        narrate: 'พระปรางค์ประธานของวัดอรุณคือแผนผังจักรวาลในคติพุทธศาสนา ฐานสี่เหลี่ยมแทนกามภูมิ ระเบียงสามชั้นที่สูงชันแทนรูปภูมิ และยอดทองที่แหลมสูงแทนอรูปภูมิเหนือเขาพระสุเมรุ เริ่มสร้างในรัชกาลที่สองและแล้วเสร็จในรัชกาลที่สาม องค์พระปรางค์สูงราวเจ็ดสิบเก้าเมตรจากระดับน้ำ ผิวฉาบปูนขาวประดับกระเบื้องเคลือบจีนกว่าล้านชิ้น บันไดทั้งสี่ด้านชันโดยตั้งใจ ผู้แสวงบุญไต่ขึ้นอย่างช้า ๆ และการขึ้นบันไดนั้นเองคือการถวายบูชา'
      }
    },
    {
      id: 'yaksha', num: '02', icon: '⚔', accent: '#5fbf94',
      pos: [-23.2, 5.4, 6.2], radius: 9, auto: true, zone: 'ubosot',
      en: {
        eyebrow: 'Ubosot Gateway · Ramakien Guardians',
        title: 'Yaksha Demon Guardians',
        thaiTitle: 'ทวารบาลยักษ์แห่งอุโบสถ',
        body: [
          'Two colossal yaksha stand at the entrance of the ordination hall, one green and one white. They are characters from the Ramakien, the Thai Ramayana, turned into guardians of the sacred precinct.',
          'The green giant is Thotsakan, the ten-faced king of Lanka, whose body is glazed in green ceramic armour. The white one is Sahassa Deja, the “thousand-eyed” demon, whose pale armour catches the dawn light from the river.',
          'Their clubs, crowns and scalloped breastplates are built up in stucco and set with broken porcelain. They do not merely decorate the gate — they mark the boundary between the river world and the ordination hall, where ordinary feet may not pass.'
        ],
        quote: 'Two demons keep the gate of the sacred — the river world stops at their feet.',
        narrate: 'Two colossal yaksha stand at the entrance of the ordination hall, one green and one white. They are characters from the Ramakien, the Thai Ramayana, turned into guardians of the sacred precinct. The green giant is Thotsakan, the ten faced king of Lanka, whose body is glazed in green ceramic armour. The white one is Sahassa Deja, the thousand eyed demon, whose pale armour catches the dawn light. Their clubs, crowns and breastplates are built in stucco and set with broken porcelain. They do not merely decorate the gate: they mark the boundary between the river world and the ordination hall.'
      },
      th: {
        eyebrow: 'ประตูอุโบสถ · ผู้พิทักษ์จากรามเกียรติ์',
        title: 'ทวารบาลยักษ์แห่งอุโบสถ',
        thaiTitle: 'ทวารบาลยักษ์แห่งอุโบสถ',
        body: [
          'ยักษ์ขนาดมหึมาสองตนยืนเฝ้าทางเข้าอุโบสถ ตนหนึ่งเขียว อีกตนหนึ่งขาว ทั้งสองเป็นตัวละครจากรามเกียรติ์ที่ถูกยกขึ้นเป็นผู้พิทักษ์เขตศักดิ์สิทธิ์',
          'ยักษ์เขียวคือทศกัณฐ์ กษัตริย์สิบพักตร์แห่งกรุงลงกา ซึ่งร่างกายประดับด้วยเกราะเซรามิกสีเขียว ส่วนยักษ์ขาวคือสหัสเดชะ ยักษ์ “พันตา” ผู้มีเกราะสีขาวที่รับแสงอรุโณทัยจากแม่น้ำ',
          'กระบอง มงกุฎ และเกราะอกจากปั้นด้วยปูนและประดับกระเบื้องแตก ทั้งสองไม่ได้เป็นเพียงเครื่องประดับประตู แต่เป็นเส้นแบ่งระหว่างโลกแห่งแม่น้ำกับอุโบสถซึ่งเท้าธรรมดาไม่อาจล่วงเข้า'
        ],
        quote: 'ยักษ์สองตนเฝ้าประตูศักดิ์สิทธิ์ — โลกแห่งแม่น้ำสิ้นสุดที่เท้าของพวกเขา',
        narrate: 'ยักษ์ขนาดมหึมาสองตนยืนเฝ้าทางเข้าอุโบสถ ตนหนึ่งเขียว อีกตนหนึ่งขาว ทั้งสองเป็นตัวละครจากรามเกียรติ์ที่ถูกยกขึ้นเป็นผู้พิทักษ์เขตศักดิ์สิทธิ์ ยักษ์เขียวคือทศกัณฐ์ กษัตริย์สิบพักตร์แห่งกรุงลงกา ผู้ประดับกายด้วยเกราะเซรามิกสีเขียว ยักษ์ขาวคือสหัสเดชะ ยักษ์พันตา ผู้มีเกราะสีขาวรับแสงอรุโณทัย กระบอง มงกุฎ และเกราะของทั้งสองปั้นด้วยปูนประดับกระเบื้องแตก ทั้งสองมิได้เป็นเพียงเครื่องประดับประตู แต่เป็นเส้นแบ่งระหว่างโลกแห่งแม่น้ำกับอุโบสถ'
      }
    },
    {
      id: 'mosaic', num: '03', icon: '❀', accent: '#7fb4dc',
      pos: [-10.2, 9.2, 17.4], radius: 8, auto: true, zone: 'prang',
      en: {
        eyebrow: 'Porcelain Skin · 19th-century mosaic',
        title: 'Chinese Porcelain Mosaic Art',
        thaiTitle: 'ศิลปะการประดับกระเบื้องเคลือบจีน',
        body: [
          'Look closely at the white tower and it becomes a garden. Flowers, peacocks, elephants, lions and warriors emerge from thousands of fragments of Chinese porcelain pressed into the stucco.',
          'Much of the porcelain arrived as ballast in Chinese trading junks that sailed up the Chao Phraya. Devout merchants donated crates of bowls and plates, some already broken, and artisans cut them into petals, leaves and scales.',
          'The palette is deceptively simple: cobalt blue, celadon green, iron red and gold. Arranged in dense floral fields, they give the prang its shimmering, almost textile surface — a mosaic that changes colour as the sun crosses the river.'
        ],
        quote: 'From broken bowls, a whole garden grows on the wall.',
        narrate: 'Look closely at the white tower and it becomes a garden. Flowers, peacocks, elephants, lions and warriors emerge from thousands of fragments of Chinese porcelain pressed into the stucco. Much of the porcelain arrived as ballast in Chinese trading junks that sailed up the Chao Phraya. Devout merchants donated crates of bowls and plates, some already broken, and artisans cut them into petals, leaves and scales. The palette is deceptively simple: cobalt blue, celadon green, iron red and gold. Arranged in dense floral fields, they give the prang its shimmering surface, a mosaic that changes colour as the sun crosses the river.'
      },
      th: {
        eyebrow: 'ผิวกระเบื้อง · งานโมเสกศตวรรษที่ 19',
        title: 'ศิลปะการประดับกระเบื้องเคลือบจีน',
        thaiTitle: 'ศิลปะการประดับกระเบื้องเคลือบจีน',
        body: [
          'เมื่อมองใกล้ ๆ พระปรางค์สีขาวจะกลายเป็นสวน ดอกไม้ นกยูง ช้าง สิงโต และนักรบ ปรากฏขึ้นจากเศษกระเบื้องเคลือบจีนนับพันชิ้นที่ฝังลงในปูน',
          'กระเบื้องจำนวนมากเดินทางมาเป็นสินค้าถ่วงท้องเรือสำเภาจีนที่แล่นขึ้นแม่น้ำเจ้าพระยา พ่อค้าผู้ศรัทธาบริจาคชามและจานเป็นหีบ ๆ บางส่วนแตกอยู่แล้ว และช่างฝีมือตัดเป็นกลีบดอก ใบไม้ และเกล็ด',
          'สีที่ใช้ดูเรียบง่ายแต่แยบยล ได้แก่ น้ำเงินโคบอลต์ เขียวเซลาดอน แดงเหล็ก และทอง จัดเรียงเป็นทุ่งลายดอกไม้หนาแน่น ทำให้พระปรางค์มีผิวระยิบระยับราวกับผ้า และเปลี่ยนสีเมื่อดวงอาทิตย์เคลื่อนข้ามแม่น้ำ'
        ],
        quote: 'จากชามที่แตกสลาย กลายเป็นสวนทั้งสวนบนผนัง',
        narrate: 'เมื่อมองใกล้ ๆ พระปรางค์สีขาวจะกลายเป็นสวน ดอกไม้ นกยูง ช้าง สิงโต และนักรบ ปรากฏขึ้นจากเศษกระเบื้องเคลือบจีนนับพันชิ้นที่ฝังลงในปูน กระเบื้องจำนวนมากเดินทางมาเป็นสินค้าถ่วงท้องเรือสำเภาจีน พ่อค้าผู้ศรัทธาบริจาคชามและจาน ช่างฝีมือตัดเป็นกลีบดอก ใบไม้ และเกล็ด สีที่ใช้คือน้ำเงินโคบอลต์ เขียวเซลาดอน แดงเหล็ก และทอง จัดเรียงเป็นทุ่งลายดอกไม้ ทำให้พระปรางค์มีผิวระยิบระยับและเปลี่ยนสีเมื่อดวงอาทิตย์เคลื่อนข้ามแม่น้ำ'
      }
    },
    {
      id: 'pier', num: '04', icon: '⛵', accent: '#59a7c8',
      pos: [47.6, 3.6, 12], radius: 9, auto: true, zone: 'promenade',
      en: {
        eyebrow: 'Chao Phraya · West Bank Landing',
        title: 'Chao Phraya River Landing Pier',
        thaiTitle: 'ท่าเรือริมแม่น้ำเจ้าพระยา',
        body: [
          'Six green granite salas line the landing, their stone columns and tiled roofs facing the water. They are Chinese in form — a reminder that this stretch of the river was shaped by Teochew traders, boatmen and craftsmen.',
          'For two centuries the Chao Phraya was Bangkok’s main road. Ferries from Tha Tien on the east bank crossed here with pilgrims, monks and merchants; royal barges passed in procession; long-tail boats still cut the current today.',
          'Stand at the railing at first light. The prang turns from grey to gold, the river takes the same colour, and the city behind you disappears into mist.'
        ],
        quote: 'The river was the road, and the temple was the destination.',
        narrate: 'Six green granite salas line the landing, their stone columns and tiled roofs facing the water. They are Chinese in form, a reminder that this stretch of the river was shaped by Teochew traders, boatmen and craftsmen. For two centuries the Chao Phraya was Bangkok’s main road. Ferries from Tha Tien on the east bank crossed here with pilgrims, monks and merchants. Royal barges passed in procession, and long tail boats still cut the current today. Stand at the railing at first light: the prang turns from grey to gold, the river takes the same colour, and the city behind you disappears into mist.'
      },
      th: {
        eyebrow: 'เจ้าพระยา · ท่าฝั่งตะวันตก',
        title: 'ท่าเรือริมแม่น้ำเจ้าพระยา',
        thaiTitle: 'ท่าเรือริมแม่น้ำเจ้าพระยา',
        body: [
          'ศาลาหินแกรนิตสีเขียวหกหลังเรียงรายริมท่าเรือ เสาหินและหลังคากระเบื้องหันหน้าสู่สายน้ำ รูปแบบสถาปัตยกรรมจีนแห่งนี้สะท้อนว่าชุมชนริมน้ำแห่งนี้ถูกหล่อหลอมโดยพ่อค้าและช่างฝีมือแต้จิ๋ว',
          'สองศตวรรษมาแล้วที่แม่น้ำเจ้าพระยาเป็นถนนสายหลักของกรุงเทพฯ เรือข้ามฟากจากท่าเตียนฝั่งตะวันออกนำผู้แสวงบุญ พระสงฆ์ และพ่อค้าข้ามมาที่นี่ เรือพระที่นั่งแล่นผ่านอย่างเป็นกระบวน และเรือหางยาวยังคงแล่นตัดกระแสน้ำจนถึงทุกวันนี้',
          'ยืนที่ราวระเบียงยามเช้าตรู่ พระปรางค์จะเปลี่ยนจากสีเทาเป็นสีทอง แม่น้ำรับสีเดียวกัน และเมืองด้านหลังคุณจะจางหายไปในหมอก'
        ],
        quote: 'แม่น้ำคือถนน และวัดคือจุดหมายปลายทาง',
        narrate: 'ศาลาหินแกรนิตสีเขียวหกหลังเรียงรายริมท่าเรือ เสาหินและหลังคากระเบื้องหันหน้าสู่สายน้ำ รูปแบบสถาปัตยกรรมจีนแห่งนี้สะท้อนว่าชุมชนริมน้ำถูกหล่อหลอมโดยพ่อค้าและช่างฝีมือแต้จิ๋ว สองศตวรรษมาแล้วที่แม่น้ำเจ้าพระยาเป็นถนนสายหลักของกรุงเทพฯ เรือข้ามฟากจากท่าเตียนนำผู้แสวงบุญและพ่อค้าข้ามมาที่นี่ เรือพระที่นั่งแล่นผ่านอย่างเป็นกระบวน และเรือหางยาวยังคงแล่นตัดกระแสน้ำจนถึงทุกวันนี้'
      }
    },
    {
      id: 'indra', num: '05', icon: '𓃰', accent: '#d9a94f',
      pos: [0, 39.5, 7.6], radius: 6, auto: false, zone: 'prang',
      en: {
        eyebrow: 'Upper Niche · Guardian of the East',
        title: 'Indra on Erawan, the Three-Headed Elephant',
        thaiTitle: 'พระอินทร์ทรงช้างเอราวัณ',
        body: [
          'High on the eastern face of the prang, Indra rides Erawan, the three-headed white elephant. Indra is guardian of the eastern quarter and lord of rain; his weapon, the vajra, splits the monsoon clouds.',
          'Erawan is Airavata, the elephant of the clouds, who draws water from the sky and pours it upon the earth. In Thai royal iconography the same mount belongs to the king, linking the ruler to the fertility of the land.',
          'The sculpture is set within a scalloped niche of porcelain and gold. From the courtyard it is a glint above the terraces; from the drone it becomes a small theatre of myth held against the sky.'
        ],
        quote: 'Above the terraces, the god of rain rides a cloud-coloured elephant.',
        narrate: 'High on the eastern face of the prang, Indra rides Erawan, the three headed white elephant. Indra is guardian of the eastern quarter and lord of rain; his weapon, the vajra, splits the monsoon clouds. Erawan is Airavata, the elephant of the clouds, who draws water from the sky and pours it upon the earth. In Thai royal iconography the same mount belongs to the king, linking the ruler to the fertility of the land. The sculpture is set within a scalloped niche of porcelain and gold.'
      },
      th: {
        eyebrow: 'ซุ้มชั้นบน · ผู้พิทักษ์ทิศตะวันออก',
        title: 'พระอินทร์ทรงช้างเอราวัณ',
        thaiTitle: 'พระอินทร์ทรงช้างเอราวัณ',
        body: [
          'สูงขึ้นไปบนผนังด้านตะวันออกของพระปรางค์ พระอินทร์ประทับบนช้างเอราวัณ ช้างเผือกสามเศียร พระอินทร์เป็นผู้พิทักษ์ทิศตะวันออกและเทพแห่งฝน อาวุธของพระองค์คือวัชระที่แหวกเมฆมรสุม',
          'เอราวัณคือไอราวตะ ช้างแห่งหมู่เมฆ ผู้สูบน้ำจากฟ้ามาราดลงสู่แผ่นดิน ในคติราชูปโภคของไทย ช้างเชือกเดียวกันนี้เป็นพาหนะของพระมหากษัตริย์ เชื่อมโยงองค์ราชันกับความอุดมสมบูรณ์ของแผ่นดิน',
          'ประติมากรรมนี้ประดิษฐานในซุ้มลายกระเบื้องและทอง จากลานด้านล่างเป็นเพียงประกายเหนือระเบียง แต่จากมุมโดรนจะกลายเป็นโรงละครเล็ก ๆ แห่งตำนานที่ตั้งตระหง่านเทียบฟ้า'
        ],
        quote: 'เหนือระเบียงขึ้นไป เทพแห่งฝนทรงช้างสีเมฆ',
        narrate: 'สูงขึ้นไปบนผนังด้านตะวันออกของพระปรางค์ พระอินทร์ประทับบนช้างเอราวัณ ช้างเผือกสามเศียร พระอินทร์เป็นผู้พิทักษ์ทิศตะวันออกและเทพแห่งฝน อาวุธของพระองค์คือวัชระที่แหวกเมฆมรสุม เอราวัณคือไอราวตะ ช้างแห่งหมู่เมฆ ผู้สูบน้ำจากฟ้ามาราดลงสู่แผ่นดิน ในคติราชูปโภคของไทย ช้างเชือกเดียวกันนี้เป็นพาหนะของพระมหากษัตริย์ ประติมากรรมนี้ประดิษฐานในซุ้มลายกระเบื้องและทอง'
      }
    }
  ];

  const HOTSPOT_BY_ID = {};
  HOTSPOTS.forEach((h) => { HOTSPOT_BY_ID[h.id] = h; });

  /* ------------------------------------------------------------------ */
  /* 3. Application state                                                */
  /* ------------------------------------------------------------------ */
  const STORAGE_KEY = 'watarun3d.journal.v1';
  const APP_VERSION = '1.0.0';
  const JOURNAL_FILE = 'watarun_3d_journal.json';

  const State = {
    lang: 'en',
    preset: 'dawn',
    mode: 'walk',
    audio: true,
    visited: [],
    photos: [],
    lastHotspot: null,
    startedAt: Date.now(),
    errors: []
  };

  const player = {
    x: 50.4,
    z: 0.0,
    y: 0.7,
    vy: 0,
    onGround: true,
    radius: 0.62,
    eye: 1.68,
    yaw: Math.PI / 2,
    pitch: 0.10
  };

  const keys = Object.create(null);
  const touchMove = { fwd: 0, back: 0, left: 0, right: 0 };
  const clock = { last: nowMs(), elapsed: 0 };
  const stepState = { dist: 0, phase: 0 };

  const ZONES = [
    { id: 'prang', test: (x, z) => x * x + z * z < 26 * 26 },
    { id: 'ubosot', test: (x, z) => x < -18 && Math.abs(z) < 26 },
    { id: 'promenade', test: (x) => x > 40 },
    { id: 'terrace', test: () => true }
  ];

  function zoneAt(x, z) {
    for (const zone of ZONES) if (zone.test(x, z)) return zone.id;
    return 'terrace';
  }

  /* ------------------------------------------------------------------ */
  /* 4. Renderer, scene, camera                                          */
  /* ------------------------------------------------------------------ */
  const stage = $('#stage');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xe8d6bf, 0.0032);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 7000);
  camera.position.set(84, 44, 72);
  camera.lookAt(0, 24, 0);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
  } catch (err) {
    State.errors.push('WebGL init: ' + err.message);
    throw err;
  }
  const DPR_CAP = IS_TOUCH ? 1.35 : 1.75;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, DPR_CAP));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  const MAX_ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  /* ------------------------------------------------------------------ */
  /* 5. Procedural textures                                              */
  /* ------------------------------------------------------------------ */
  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  function canvasTexture(w, h, draw, repeatX, repeatY, srgb) {
    const c = makeCanvas(w, h);
    const ctx = c.getContext('2d');
    draw(ctx, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX || 1, repeatY || 1);
    tex.anisotropy = MAX_ANISO;
    if (srgb !== false) tex.encoding = THREE.sRGBEncoding;
    tex.needsUpdate = true;
    return tex;
  }

  function noiseFill(ctx, w, h, base, amount, alpha) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * amount;
      d[i] = clamp(d[i] + n, 0, 255);
      d[i + 1] = clamp(d[i + 1] + n, 0, 255);
      d[i + 2] = clamp(d[i + 2] + n, 0, 255);
      d[i + 3] = (d[i + 3] / 255) * (alpha === undefined ? 1 : alpha) * 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  const TEX = {};

  TEX.stucco = canvasTexture(256, 256, (ctx, w, h) => {
    noiseFill(ctx, w, h, '#efe7d6', 22);
    ctx.globalAlpha = 0.16;
    for (let i = 0; i < 26; i++) {
      ctx.strokeStyle = Math.random() > 0.5 ? '#c8bca4' : '#fffaf0';
      ctx.lineWidth = Math.random() * 1.4 + 0.3;
      ctx.beginPath();
      let x = Math.random() * w, y = Math.random() * h;
      ctx.moveTo(x, y);
      for (let j = 0; j < 4; j++) {
        x += (Math.random() - 0.5) * 42;
        y += (Math.random() - 0.5) * 42;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, 2, 2);

  TEX.stuccoBump = canvasTexture(256, 256, (ctx, w, h) => {
    noiseFill(ctx, w, h, '#808080', 34);
    for (let i = 0; i < 2400; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#9a9a9a' : '#666';
      ctx.globalAlpha = 0.35;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
  }, 3, 3, false);

  const MOSAIC_PALETTE = ['#2f6fa8', '#3d8a68', '#b5482f', '#d9a94f', '#7d5aa0', '#e8e0cb', '#4fa3c4'];

  function drawMosaic(ctx, w, h) {
    ctx.fillStyle = '#f6f1e3';
    ctx.fillRect(0, 0, w, h);
    const cell = 46;
    for (let y = 0; y < h; y += cell) {
      for (let x = 0; x < w; x += cell) {
        const cx = x + cell / 2, cy = y + cell / 2;
        const col = MOSAIC_PALETTE[(Math.random() * MOSAIC_PALETTE.length) | 0];
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.random() * Math.PI);
        const petals = 4 + ((Math.random() * 4) | 0);
        ctx.fillStyle = col;
        for (let p = 0; p < petals; p++) {
          ctx.rotate((Math.PI * 2) / petals);
          ctx.beginPath();
          ctx.ellipse(cell * 0.19, 0, cell * 0.15, cell * 0.075, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = Math.random() > 0.5 ? '#d9a94f' : '#f6f1e3';
        ctx.beginPath();
        ctx.arc(0, 0, cell * 0.075, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // little breaks between tiles
        ctx.strokeStyle = 'rgba(120,110,95,.18)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      }
    }
    // larger floral medallions
    for (let i = 0; i < 5; i++) {
      const cx = (i + 0.5) * (w / 5), cy = h / 2;
      ctx.save();
      ctx.translate(cx, cy);
      for (let p = 0; p < 8; p++) {
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = p % 2 ? 'rgba(47,111,168,.85)' : 'rgba(61,138,104,.8)';
        ctx.beginPath();
        ctx.ellipse(0, -cell * 0.85, cell * 0.24, cell * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#d9a94f';
      ctx.beginPath();
      ctx.arc(0, 0, cell * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  TEX.mosaic = canvasTexture(512, 512, drawMosaic, 1, 1);
  TEX.mosaicBump = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#707070';
    ctx.fillRect(0, 0, w, h);
    const cell = 46;
    for (let y = 0; y < h; y += cell) {
      for (let x = 0; x < w; x += cell) {
        ctx.fillStyle = 'rgba(255,255,255,' + (0.25 + Math.random() * 0.5) + ')';
        ctx.beginPath();
        ctx.arc(x + cell / 2, y + cell / 2, cell * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.55)';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(x + 1, y + 1, cell - 2, cell - 2);
      }
    }
  }, 2, 3, false);

  TEX.gold = canvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#f7e3ab');
    g.addColorStop(0.35, '#d9ae57');
    g.addColorStop(0.6, '#a9772b');
    g.addColorStop(1, '#f0d08a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(90,55,10,.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      const y = Math.random() * h;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.3, y + 12, w * 0.7, y - 12, w, y + 4);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,245,205,.5)';
    for (let i = 0; i < 26; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 2 + Math.random() * 11, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, 1, 1);

  TEX.stone = canvasTexture(512, 512, (ctx, w, h) => {
    noiseFill(ctx, w, h, '#9a9385', 26);
    const bw = 128, bh = 64;
    for (let y = 0; y < h; y += bh) {
      const off = (y / bh) % 2 ? bw / 2 : 0;
      for (let x = -bw; x < w; x += bw) {
        ctx.strokeStyle = 'rgba(60,54,45,.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + off + 1, y + 1, bw - 2, bh - 2);
        ctx.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.06) + ')';
        ctx.fillRect(x + off + 2, y + 2, bw - 4, bh - 4);
      }
    }
  }, 8, 8);

  TEX.paving = canvasTexture(512, 512, (ctx, w, h) => {
    noiseFill(ctx, w, h, '#b8ad97', 20);
    const s = 64;
    for (let y = 0; y < h; y += s) {
      for (let x = 0; x < w; x += s) {
        ctx.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.09) + ')';
        ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
        ctx.strokeStyle = 'rgba(80,72,60,.30)';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
      }
    }
  }, 10, 10);

  TEX.roof = canvasTexture(256, 256, (ctx, w, h) => {
    noiseFill(ctx, w, h, '#8a3f2d', 18);
    for (let y = 0; y < h; y += 16) {
      ctx.fillStyle = 'rgba(50,18,10,.35)';
      ctx.fillRect(0, y, w, 2);
      ctx.fillStyle = 'rgba(255,180,140,.10)';
      ctx.fillRect(0, y + 2, w, 4);
    }
    for (let x = 0; x < w; x += 32) {
      ctx.fillStyle = 'rgba(40,14,8,.18)';
      ctx.fillRect(x, 0, 2, h);
    }
  }, 4, 4);

  TEX.grass = canvasTexture(256, 256, (ctx, w, h) => {
    noiseFill(ctx, w, h, '#35412a', 26);
    for (let i = 0; i < 1800; i++) {
      ctx.strokeStyle = 'rgba(' + (60 + Math.random() * 50) + ',' + (80 + Math.random() * 60) + ',50,.35)';
      ctx.lineWidth = 1;
      const x = Math.random() * w, y = Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 4, y - 2 - Math.random() * 4);
      ctx.stroke();
    }
  }, 30, 30);

  TEX.wood = canvasTexture(256, 256, (ctx, w, h) => {
    noiseFill(ctx, w, h, '#5b3a26', 18);
    for (let i = 0; i < 60; i++) {
      ctx.strokeStyle = 'rgba(30,16,8,.28)';
      ctx.lineWidth = 0.6 + Math.random() * 1.6;
      ctx.beginPath();
      const x = Math.random() * w;
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 8, h * 0.3, x - 8, h * 0.7, x + 3, h);
      ctx.stroke();
    }
  }, 2, 2);

  TEX.granite = canvasTexture(256, 256, (ctx, w, h) => {
    noiseFill(ctx, w, h, '#2f5a4a', 30);
    for (let i = 0; i < 2500; i++) {
      ctx.fillStyle = 'rgba(' + (120 + Math.random() * 90) + ',' + (150 + Math.random() * 70) + ',' + (130 + Math.random() * 70) + ',.18)';
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.4, 1.4);
    }
  }, 2, 2);

  function makeWaterNormal() {
    const size = 256;
    // deterministic value-noise with periodic wrap for a seamless, non-tiled look
    let seed = 1337;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const grids = {};
    const gridFor = (n) => {
      if (grids[n]) return grids[n];
      const a = new Float32Array(n * n);
      for (let i = 0; i < a.length; i++) a[i] = rand();
      grids[n] = a;
      return a;
    };
    const smooth = (t) => t * t * (3 - 2 * t);
    const sample = (grid, n, x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y);
      const fx = smooth(x - xi), fy = smooth(y - yi);
      const g = (i, j) => grid[(((j % n) + n) % n) * n + (((i % n) + n) % n)];
      const a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1);
      return lerp(lerp(a, b, fx), lerp(c, d, fx), fy);
    };
    const octaves = [
      { n: 3, amp: 0.62 }, { n: 5, amp: 0.30 },
      { n: 9, amp: 0.14 }, { n: 17, amp: 0.06 }
    ];
    octaves.forEach((o) => gridFor(o.n));

    const c = makeCanvas(size, size);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(size, size);
    const height = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let h = 0;
        octaves.forEach((o) => {
          h += sample(gridFor(o.n), o.n, (x / size) * o.n, (y / size) * o.n) * o.amp;
        });
        height[y * size + x] = h;
      }
    }
    const at = (x, y) => height[((y + size) % size) * size + ((x + size) % size)];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (at(x + 1, y) - at(x - 1, y)) * 5.2;
        const dy = (at(x, y + 1) - at(x, y - 1)) * 5.2;
        const nx = -dx, ny = -dy, nz = 1;
        const len = Math.hypot(nx, ny, nz);
        const i = (y * size + x) * 4;
        img.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
        img.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
        img.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(26, 30);
    tex.anisotropy = MAX_ANISO;
    return tex;
  }
  TEX.waterNormal = makeWaterNormal();

  TEX.mosaicWall = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#f3eddd';
    ctx.fillRect(0, 0, w, h);
    // large peacock-ish medallion panels with porcelain borders
    for (let py = 0; py < 2; py++) {
      for (let px = 0; px < 2; px++) {
        const cx = (px + 0.5) * (w / 2), cy = (py + 0.5) * (h / 2);
        ctx.strokeStyle = '#2f6fa8';
        ctx.lineWidth = 8;
        ctx.strokeRect(cx - 88, cy - 88, 176, 176);
        ctx.strokeStyle = '#d9a94f';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx - 78, cy - 78, 156, 156);
        for (let p = 0; p < 12; p++) {
          const a = (p / 12) * Math.PI * 2;
          ctx.fillStyle = MOSAIC_PALETTE[p % MOSAIC_PALETTE.length];
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * 46, cy + Math.sin(a) * 46, 15, 8, a, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#3d8a68';
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d9a94f';
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.strokeStyle = 'rgba(120,110,95,.16)';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 13);
      ctx.lineTo(w, i * 13 + 6);
      ctx.stroke();
    }
  }, 2, 2);

  TEX.door = canvasTexture(256, 512, (ctx, w, h) => {
    ctx.fillStyle = '#3b1e12';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#d9a94f';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    for (let y = 26; y < h - 20; y += 48) {
      ctx.strokeStyle = 'rgba(217,169,79,.75)';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, y, w - 48, 34);
      ctx.fillStyle = 'rgba(217,169,79,.18)';
      ctx.fillRect(24, y, w - 48, 34);
      ctx.fillStyle = '#d9a94f';
      for (let x = 34; x < w - 30; x += 24) {
        ctx.beginPath();
        ctx.arc(x + 6, y + 17, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#d9a94f';
    ctx.fillRect(w / 2 - 3, 0, 6, h);
  }, 1, 1);

  /* ------------------------------------------------------------------ */
  /* 6. Materials                                                        */
  /* ------------------------------------------------------------------ */
  const MAT = {
    stucco: new THREE.MeshStandardMaterial({
      color: 0xe2d6bd, map: TEX.stucco, bumpMap: TEX.stuccoBump, bumpScale: 0.12,
      roughness: 0.9, metalness: 0.02, envMapIntensity: 0.5
    }),
    stuccoWarm: new THREE.MeshStandardMaterial({
      color: 0xe4d7bf, map: TEX.stucco, bumpMap: TEX.stuccoBump, bumpScale: 0.1,
      roughness: 0.94, metalness: 0.02, envMapIntensity: 0.4
    }),
    mosaic: new THREE.MeshStandardMaterial({
      color: 0xffffff, map: TEX.mosaic, bumpMap: TEX.mosaicBump, bumpScale: 0.16,
      roughness: 0.52, metalness: 0.04, envMapIntensity: 0.8
    }),
    mosaicWall: new THREE.MeshStandardMaterial({
      color: 0xffffff, map: TEX.mosaicWall, bumpMap: TEX.mosaicBump, bumpScale: 0.12,
      roughness: 0.55, metalness: 0.04, envMapIntensity: 0.7
    }),
    gold: new THREE.MeshStandardMaterial({
      color: 0xe0b052, map: TEX.gold, metalness: 0.82, roughness: 0.28,
      envMapIntensity: 1.4, emissive: 0x3a2404, emissiveIntensity: 0.55
    }),
    goldDark: new THREE.MeshStandardMaterial({
      color: 0xc4913f, map: TEX.gold, metalness: 0.7, roughness: 0.42,
      envMapIntensity: 1.2, emissive: 0x2a1802, emissiveIntensity: 0.45
    }),
    stone: new THREE.MeshStandardMaterial({
      color: 0xb3aa97, map: TEX.paving, roughness: 0.88, metalness: 0.02, envMapIntensity: 0.4
    }),
    stoneDark: new THREE.MeshStandardMaterial({
      color: 0x7e776a, map: TEX.stone, roughness: 0.92, metalness: 0.02, envMapIntensity: 0.35
    }),
    granite: new THREE.MeshStandardMaterial({
      color: 0xa9bdae, map: TEX.granite, roughness: 0.55, metalness: 0.16, envMapIntensity: 0.7
    }),
    roof: new THREE.MeshStandardMaterial({
      color: 0xffffff, map: TEX.roof, roughness: 0.72, metalness: 0.06, envMapIntensity: 0.5
    }),
    teak: new THREE.MeshStandardMaterial({
      color: 0xffffff, map: TEX.wood, roughness: 0.78, metalness: 0.03, envMapIntensity: 0.4
    }),
    panelBack: new THREE.MeshStandardMaterial({
      color: 0x232c38, roughness: 0.72, metalness: 0.22, envMapIntensity: 0.5
    }),
    city: new THREE.MeshStandardMaterial({
      color: 0x33404f, roughness: 0.95, metalness: 0.05
    }),
    door: new THREE.MeshStandardMaterial({
      color: 0xffffff, map: TEX.door, roughness: 0.5, metalness: 0.25, envMapIntensity: 0.8
    }),
    grass: new THREE.MeshStandardMaterial({
      color: 0xffffff, map: TEX.grass, roughness: 1.0, metalness: 0
    }),
    water: new THREE.MeshStandardMaterial({
      color: 0x0d2b3a, normalMap: TEX.waterNormal, normalScale: new THREE.Vector2(0.62, 0.62),
      roughness: 0.33, metalness: 0.45, envMapIntensity: 1.0, transparent: true, opacity: 0.97
    }),
    yakshaGreen: new THREE.MeshStandardMaterial({
      color: 0x2f7d5b, roughness: 0.42, metalness: 0.18, envMapIntensity: 0.9
    }),
    yakshaWhite: new THREE.MeshStandardMaterial({
      color: 0xe9e3d2, roughness: 0.46, metalness: 0.1, envMapIntensity: 0.85
    }),
    yakshaDark: new THREE.MeshStandardMaterial({
      color: 0x1b2a22, roughness: 0.55, metalness: 0.3
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x2f4a26, roughness: 0.95, metalness: 0, flatShading: true
    }),
    foliageLight: new THREE.MeshStandardMaterial({
      color: 0x476437, roughness: 0.95, metalness: 0, flatShading: true
    }),
    lampGlass: new THREE.MeshStandardMaterial({
      color: 0xffdca0, emissive: 0xffb45c, emissiveIntensity: 0.35, roughness: 0.4,
      transparent: true, opacity: 0.9
    }),
    dark: new THREE.MeshStandardMaterial({ color: 0x161b1f, roughness: 0.8, metalness: 0.2 }),
    boatWood: new THREE.MeshStandardMaterial({ color: 0x6c4b2e, roughness: 0.8, metalness: 0.05 }),
    boatPaint: new THREE.MeshStandardMaterial({ color: 0xb8452f, roughness: 0.65, metalness: 0.08 })
  };

  /* ------------------------------------------------------------------ */
  /* 7. Scene groups                                                     */
  /* ------------------------------------------------------------------ */
  const world = new THREE.Group();
  world.name = 'WatArunWorld';
  scene.add(world);

  const groups = {
    ground: new THREE.Group(),
    terrace: new THREE.Group(),
    prang: new THREE.Group(),
    satellites: new THREE.Group(),
    mondops: new THREE.Group(),
    ubosot: new THREE.Group(),
    promenade: new THREE.Group(),
    water: new THREE.Group(),
    gardens: new THREE.Group(),
    markers: new THREE.Group(),
    boats: new THREE.Group()
  };
  Object.keys(groups).forEach((k) => { groups[k].name = 'group-' + k; world.add(groups[k]); });

  const colliders = { circles: [], boxes: [] };
  const lightRig = {};
  const animated = { boats: [], lanterns: [], water: null, stars: null, markerMeshes: [] };
  const buildStats = { meshes: 0, instances: 0, salas: 0, satellites: 0, mondops: 0, yakshas: 0 };
  let centralPrang = null;
  /* ------------------------------------------------------------------ */
  /* 8. Geometry helpers                                                 */
  /* ------------------------------------------------------------------ */
  function mesh(geo, mat, x, y, z, parent, cast, receive) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (cast) m.castShadow = true;
    if (receive) m.receiveShadow = true;
    (parent || world).add(m);
    buildStats.meshes++;
    return m;
  }

  function box(w, h, d, mat, x, y, z, parent, cast, receive) {
    return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent, cast, receive);
  }

  const GEO = {
    cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
    cyl8: new THREE.CylinderGeometry(1, 1, 1, 8),
    sphere: new THREE.SphereGeometry(1, 16, 12),
    sphereLow: new THREE.SphereGeometry(1, 10, 8),
    cone: new THREE.ConeGeometry(1, 1, 12),
    cone4: new THREE.ConeGeometry(1, 1, 4),
    torus: new THREE.TorusGeometry(1, 0.1, 8, 24)
  };

  function instanced(geo, mat, items, parent, cast, receive) {
    if (!items.length) return null;
    const im = new THREE.InstancedMesh(geo, mat, items.length);
    const dummy = new THREE.Object3D();
    items.forEach((it, i) => {
      dummy.position.set(it[0], it[1], it[2]);
      dummy.rotation.set(it[3] || 0, it[4] || 0, it[5] || 0);
      const sx = it[6] === undefined ? 1 : it[6];
      const sy = it[7] === undefined ? 1 : it[7];
      const sz = it[8] === undefined ? 1 : it[8];
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
    if (cast) im.castShadow = true;
    if (receive) im.receiveShadow = true;
    (parent || world).add(im);
    buildStats.instances += items.length;
    return im;
  }

  function addCircle(x, z, r) { colliders.circles.push({ x, z, r }); }
  function addBoxCollider(minX, maxX, minZ, maxZ) {
    colliders.boxes.push({ minX, maxX, minZ, maxZ });
  }

  /* ------------------------------------------------------------------ */
  /* 9. Sky dome, stars, environment                                     */
  /* ------------------------------------------------------------------ */
  const skyUniforms = {
    topColor: { value: new THREE.Color(0x4f7fae) },
    midColor: { value: new THREE.Color(0xf2c48f) },
    bottomColor: { value: new THREE.Color(0xffd7a8) },
    sunDir: { value: new THREE.Vector3(0.85, 0.18, 0.32).normalize() },
    sunColor: { value: new THREE.Color(0xffd2a0) },
    sunGlow: { value: 1.0 },
    stars: { value: 0.0 },
    time: { value: 0.0 }
  };

  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `
      varying vec3 vWorldPos;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 topColor, midColor, bottomColor, sunColor;
      uniform vec3 sunDir;
      uniform float sunGlow, stars, time;
      varying vec3 vWorldPos;

      float hash(vec3 p){
        return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453);
      }

      void main(){
        vec3 dir = normalize(vWorldPos);
        float h = clamp(dir.y, 0.0, 1.0);
        vec3 col = mix(bottomColor, topColor, pow(h, 0.52));
        col = mix(col, midColor, pow(1.0 - abs(dir.y), 9.0) * 0.55);
        col = mix(col, bottomColor * 1.06, pow(1.0 - h, 14.0) * 0.7);

        float sd = max(dot(dir, normalize(sunDir)), 0.0);
        col += sunColor * pow(sd, 1200.0) * 2.2 * sunGlow;
        col += sunColor * pow(sd, 22.0) * 0.30 * sunGlow;
        col += sunColor * pow(sd, 4.0) * 0.07 * sunGlow;

        if (stars > 0.001 && dir.y > 0.015){
          vec3 id = floor(dir * 320.0);
          float n = hash(id);
          float s = step(0.9978, n) * smoothstep(0.0, 0.20, dir.y);
          float tw = 0.55 + 0.45 * sin(time * 1.6 + n * 80.0);
          col += vec3(0.85, 0.92, 1.0) * s * tw * stars * 1.5;
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `
  });

  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(4000, 40, 24), skyMaterial);
  skyDome.name = 'sky';
  skyDome.frustumCulled = false;
  scene.add(skyDome);

  // a faint sun/moon disc made of a sprite (visible through fog)
  const sunTexture = (() => {
    const c = makeCanvas(128, 128);
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,248,225,1)');
    g.addColorStop(0.22, 'rgba(255,226,170,.85)');
    g.addColorStop(0.55, 'rgba(255,190,120,.22)');
    g.addColorStop(1, 'rgba(255,180,110,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  })();

  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: sunTexture, color: 0xffffff, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, fog: false
  }));
  sunSprite.scale.set(120, 120, 1);
  scene.add(sunSprite);

  const starGeo = new THREE.BufferGeometry();
  {
    const N = 1400;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.pow(Math.random(), 0.6) * 0.92 + 0.06;
      const r = 640;
      const y = v * r;
      const rr = Math.sqrt(Math.max(0, r * r - y * y));
      pos[i * 3] = Math.cos(u) * rr;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(u) * rr;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  }
  const starMat = new THREE.PointsMaterial({
    color: 0xdfe8ff, size: 1.7, sizeAttenuation: false, transparent: true,
    opacity: 0, depthWrite: false, fog: false
  });
  animated.stars = new THREE.Points(starGeo, starMat);
  animated.stars.frustumCulled = false;
  scene.add(animated.stars);

  const cloudTexture = (() => {
    const c = makeCanvas(256, 128);
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 256, 128);
    for (let i = 0; i < 42; i++) {
      const x = 46 + Math.random() * 164;
      const y = 40 + Math.random() * 46;
      const r = 10 + Math.random() * 22;
      const g = ctx.createRadialGradient(x, y, 1, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,.55)');
      g.addColorStop(0.55, 'rgba(255,255,255,.22)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.5, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const img = ctx.getImageData(0, 0, 256, 128);
    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 256; x++) {
        const nx = x / 255, ny = y / 127;
        const edge = Math.min(1, nx / 0.16) * Math.min(1, (1 - nx) / 0.16) *
          Math.min(1, ny / 0.22) * Math.min(1, (1 - ny) / 0.22);
        const i = (y * 256 + x) * 4;
        img.data[i + 3] = img.data[i + 3] * edge;
      }
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  })();

  const cloudGroup = new THREE.Group();
  cloudGroup.name = 'clouds';
  scene.add(cloudGroup);
  const clouds = [];
  for (let i = 0; i < 8; i++) {
    const mat = new THREE.SpriteMaterial({
      map: cloudTexture, transparent: true, depthWrite: false, fog: false,
      opacity: 0.32, color: 0xffe8d2
    });
    const sp = new THREE.Sprite(mat);
    const a = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
    const r = 1000 + Math.random() * 900;
    sp.position.set(Math.cos(a) * r, 300 + Math.random() * 240, Math.sin(a) * r);
    const s = 240 + Math.random() * 300;
    sp.scale.set(s, s * 0.42, 1);
    sp.userData.drift = 0.4 + Math.random() * 1.4;
    cloudGroup.add(sp);
    clouds.push(sp);
  }

  const envScene = new THREE.Scene();
  const envSky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), skyMaterial);
  envScene.add(envSky);
  let envRT = null;

  function updateEnvironment() {
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      if (envRT) envRT.dispose();
      envRT = pmrem.fromScene(envScene, 0.04);
      scene.environment = envRT.texture;
      pmrem.dispose();
    } catch (e) {
      State.errors.push('env: ' + e.message);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 10. Lighting rig                                                    */
  /* ------------------------------------------------------------------ */
  const hemi = new THREE.HemisphereLight(0xbcd6f0, 0x6b5a48, 0.8);
  scene.add(hemi);

  const ambient = new THREE.AmbientLight(0xffe6c4, 0.16);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0xffd2a0, 2.2);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(IS_TOUCH ? 1024 : 2048, IS_TOUCH ? 1024 : 2048);
  sunLight.shadow.camera.left = -85;
  sunLight.shadow.camera.right = 85;
  sunLight.shadow.camera.top = 90;
  sunLight.shadow.camera.bottom = -70;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 320;
  sunLight.shadow.bias = -0.0007;
  sunLight.shadow.normalBias = 0.03;
  scene.add(sunLight);
  scene.add(sunLight.target);
  sunLight.target.position.set(0, 8, 0);

  lightRig.floodlights = [];
  const floodSpecs = [
    [-18, 2.2, 18, 0, 32, 0],
    [22, 2.2, 14, 0, 34, 0],
    [-22, 2.2, -16, 0, 32, 0],
    [18, 2.2, -20, 0, 36, 0],
    [-26, 1.6, -24, 0, 64, 0],
    [26, 1.6, 24, 0, 60, 0]
  ];
  floodSpecs.forEach((s, i) => {
    const sp = new THREE.SpotLight(0xffc46b, 0, 150, 0.44, 0.72, 1.2);
    sp.position.set(s[0], s[1], s[2]);
    sp.target.position.set(s[3], s[4], s[5]);
    sp.castShadow = false;
    scene.add(sp);
    scene.add(sp.target);
    lightRig.floodlights.push({ light: sp, base: (i < 4 ? 2.4 : 1.7) + (i % 3) * 0.18 });
  });

  lightRig.promLights = [];
  [-24, 12, 34].forEach((z) => {
    const pt = new THREE.PointLight(0xffb45c, 0, 15, 2);
    pt.position.set(47.6, 4.4, z);
    scene.add(pt);
    lightRig.promLights.push(pt);
  });

  lightRig.moon = new THREE.DirectionalLight(0x9fb6e6, 0);
  lightRig.moon.position.set(-90, 120, 70);
  scene.add(lightRig.moon);

  /* ------------------------------------------------------------------ */
  /* 11. Ground, terrace and river                                     */
  /* ------------------------------------------------------------------ */
  const TERRACE = { minX: -48, maxX: 36, minZ: -41, maxZ: 41, y: 1.5 };
  const BOARDWALK = { minX: 41.5, maxX: 53.4, minZ: -50, maxZ: 50, y: 0.7 };
  const RIVER_X = 53.6;

  function groundHeight(x, z) {
    if (x >= TERRACE.minX && x <= TERRACE.maxX && z >= TERRACE.minZ && z <= TERRACE.maxZ) return TERRACE.y;
    if (x > TERRACE.maxX && x < BOARDWALK.minX && Math.abs(z) <= 8.5) {
      return lerp(TERRACE.y, BOARDWALK.y, clamp((x - TERRACE.maxX) / (BOARDWALK.minX - TERRACE.maxX), 0, 1));
    }
    if (x >= BOARDWALK.minX && x <= BOARDWALK.maxX && Math.abs(z) <= 50) return BOARDWALK.y;
    return 0;
  }

  function buildGround() {
    const g = groups.ground;

    // far bank / city shelf on the east side (very low, mostly hidden by water & mist)
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(800, 900, 1, 1), MAT.grass);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(-350, 0, 0);
    grass.receiveShadow = true;
    g.add(grass);
    buildStats.meshes++;

    // terrace platform (solid block)
    const terr = box(TERRACE.maxX - TERRACE.minX, TERRACE.y, TERRACE.maxZ - TERRACE.minZ, MAT.stoneDark,
      (TERRACE.maxX + TERRACE.minX) / 2, TERRACE.y / 2, 0, g, false, true);
    terr.name = 'terrace-block';

    // paved top surface
    const top = new THREE.Mesh(new THREE.PlaneGeometry(TERRACE.maxX - TERRACE.minX, TERRACE.maxZ - TERRACE.minZ), MAT.stone);
    top.rotation.x = -Math.PI / 2;
    top.position.set((TERRACE.maxX + TERRACE.minX) / 2, TERRACE.y + 0.012, 0);
    top.receiveShadow = true;
    g.add(top);

    // boardwalk
    const bw = box(BOARDWALK.maxX - BOARDWALK.minX, BOARDWALK.y, 100, MAT.stone,
      (BOARDWALK.maxX + BOARDWALK.minX) / 2, BOARDWALK.y / 2, 0, g, false, true);
    bw.name = 'boardwalk';
    // boardwalk edge stone
    box(0.5, 0.9, 100, MAT.stoneDark, BOARDWALK.maxX, 0.45, 0, g, false, true);

    // river wall down to water
    box(0.6, 3.2, 102, MAT.stoneDark, RIVER_X + 0.1, -0.9, 0, g, false, true);

    // ramp / steps between terrace and boardwalk
    const rampLen = BOARDWALK.minX - TERRACE.maxX;
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(rampLen, 0.8), 0.18, 17), MAT.stone);
    ramp.position.set((TERRACE.maxX + BOARDWALK.minX) / 2, (TERRACE.y + BOARDWALK.y) / 2 + 0.05, 0);
    ramp.rotation.z = Math.atan2(BOARDWALK.y - TERRACE.y, rampLen);
    ramp.receiveShadow = true;
    g.add(ramp);
    // steps for visual read
    const steps = [];
    for (let i = 0; i < 8; i++) {
      const t = (i + 0.5) / 8;
      steps.push([lerp(TERRACE.maxX + 0.2, BOARDWALK.minX - 0.2, t), lerp(TERRACE.y, BOARDWALK.y, t) - 0.06, 0, 0, 0, 0, 1, 1, 17]);
    }
    instanced(new THREE.BoxGeometry(0.75, 0.14, 1), MAT.stone, steps, g, false, true);

    // low retaining walls on the terrace edge, leaving the ramp open
    const edgeMat = MAT.stuccoWarm;
    box(0.7, 1.15, 32.5, edgeMat, TERRACE.maxX + 0.35, TERRACE.y + 0.55, -24.75, g, true, true);
    box(0.7, 1.15, 32.5, edgeMat, TERRACE.maxX + 0.35, TERRACE.y + 0.55, 24.75, g, true, true);
    addBoxCollider(TERRACE.maxX, TERRACE.maxX + 0.8, -41, -8.5);
    addBoxCollider(TERRACE.maxX, TERRACE.maxX + 0.8, 8.5, 41);

    // perimeter walls (north, south, west) with redented posts
    function wallRun(x1, z1, x2, z2) {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const rot = Math.atan2(dx, dz);
      const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
      const wall = box(0.8, 2.0, len, MAT.stuccoWarm, cx, TERRACE.y + 1.0, cz, g, true, true);
      wall.rotation.y = rot;
      const cap = box(1.05, 0.22, len, MAT.stoneDark, cx, TERRACE.y + 2.05, cz, g, true, true);
      cap.rotation.y = rot;
      const posts = [];
      const n = Math.max(2, Math.round(len / 6));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        posts.push([lerp(x1, x2, t), TERRACE.y + 1.15, lerp(z1, z2, t), 0, 0, 0, 0.9, 2.3, 0.9]);
      }
      instanced(new THREE.BoxGeometry(1, 1, 1), MAT.stucco, posts, g, true, true);
      // colliders as thin boxes
      addBoxCollider(Math.min(x1, x2) - 0.6, Math.max(x1, x2) + 0.6, Math.min(z1, z2) - 0.6, Math.max(z1, z2) + 0.6);
    }
    wallRun(-47.4, -41.2, 35.8, -41.2);
    wallRun(-47.4, 41.2, 35.8, 41.2);
    wallRun(-47.4, -41.2, -47.4, 41.2);

    // entrance gate on the south wall (decorative)
    const gate = new THREE.Group();
    gate.position.set(10, TERRACE.y, 41.2);
    box(7.6, 0.7, 2.6, MAT.stoneDark, 0, 0.35, 0, gate, true, true);
    [-3.2, 3.2].forEach((x) => box(0.9, 4.4, 0.9, MAT.stucco, x, 2.2, 0, gate, true, true));
    box(8.5, 0.9, 1.5, MAT.stucco, 0, 4.55, 0, gate, true, true);
    const roof = mesh(new THREE.ConeGeometry(4.4, 2.2, 4), MAT.roof, 0, 6.0, 0, gate, true, true);
    roof.rotation.y = Math.PI / 4;
    mesh(new THREE.ConeGeometry(0.5, 1.4, 6), MAT.gold, 0, 7.7, 0, gate, true, true);
    g.add(gate);

    // ceremonial approach from the river ramp to the prang
    const path = box(5.4, 0.06, 22.0, MAT.stone, 25.2, TERRACE.y + 0.04, 0, g, false, true);
    path.name = 'approach-path';
    box(0.35, 0.09, 22.0, MAT.mosaicWall, 22.2, TERRACE.y + 0.05, 0, g, false, true);
    box(0.35, 0.09, 22.0, MAT.mosaicWall, 28.2, TERRACE.y + 0.05, 0, g, false, true);

    const planterPositions = [];
    [32.5, 28.5, 24.5, 20.5].forEach((x) => {
      [-3.9, 3.9].forEach((z) => planterPositions.push([x, z]));
    });
    planterPositions.forEach((pp) => {
      const pot = mesh(new THREE.CylinderGeometry(0.62, 0.48, 0.85, 10), MAT.stoneDark, pp[0], TERRACE.y + 0.42, pp[1], g, true, true);
      pot.name = 'planter';
      const shrub = mesh(new THREE.SphereGeometry(0.62, 8, 6), MAT.foliageLight, pp[0], TERRACE.y + 1.15, pp[1], g, true, true);
      shrub.scale.y = 0.8;
      const flower = mesh(new THREE.SphereGeometry(0.16, 6, 5), MAT.stuccoWarm, pp[0] + 0.2, TERRACE.y + 1.45, pp[1] - 0.15, g, false, false);
      flower.name = 'frangipani';
    });

    // flag masts with Thai tricolour banners
    [-10.5, 10.5].forEach((z) => {
      const pole = mesh(new THREE.CylinderGeometry(0.09, 0.12, 9.5, 8), MAT.goldDark, 34.0, TERRACE.y + 4.75, z, g, true, true);
      pole.name = 'flag-mast';
      box(0.06, 0.9, 2.4, MAT.stuccoWarm, 34.06, TERRACE.y + 8.7, z + 1.2, g, false, false);
      box(0.07, 0.3, 2.4, MAT.boatPaint, 34.08, TERRACE.y + 8.9, z + 1.2, g, false, false);
      box(0.07, 0.3, 2.4, MAT.city, 34.08, TERRACE.y + 8.3, z + 1.2, g, false, false);
      addCircle(34.0, z, 0.5);
    });

    // small mooring bollards along the boardwalk
    const bollards = [];
    for (let z = -44; z <= 44; z += 5.5) bollards.push([BOARDWALK.maxX - 0.9, 1.05, z, 0, 0, 0, 0.16, 0.7, 0.16]);
    instanced(new THREE.CylinderGeometry(1, 1, 1, 8), MAT.stoneDark, bollards, g, true, true);
  }

  /* ------------------------------------------------------------------ */
  /* 12. The central prang                                              */
  /* ------------------------------------------------------------------ */
  const PRANG_TIERS = [
    { w: 24.0, h: 2.4 },
    { w: 21.0, h: 6.2, panel: true },
    { w: 19.0, h: 5.0, ledge: true },
    { w: 17.0, h: 7.0, panel: true },
    { w: 15.0, h: 4.4, ledge: true },
    { w: 13.0, h: 7.4, panel: true },
    { w: 11.0, h: 5.8 },
    { w: 9.0, h: 5.2, panel: true },
    { w: 7.2, h: 4.6 },
    { w: 5.4, h: 3.8 },
    { w: 3.8, h: 3.0 }
  ];

  function addGallery(parent, halfW, y, railing, mat) {
    const ringW = halfW * 2 + 2.4;
    const t = 0.55;
    box(ringW, t, 2.2, mat, 0, y, halfW + 0.5, parent, true, true);
    box(ringW, t, 2.2, mat, 0, y, -halfW - 0.5, parent, true, true);
    box(2.2, t, ringW, mat, halfW + 0.5, y, 0, parent, true, true);
    box(2.2, t, ringW, mat, -halfW - 0.5, y, 0, parent, true, true);
    if (!railing) return;
    const h = 0.95;
    const posts = [];
    const step = 1.45;
    const edge = halfW + 1.5;
    for (let x = -edge; x <= edge; x += step) {
      posts.push([x, y + h / 2 + t / 2, edge, 0, 0, 0]);
      posts.push([x, y + h / 2 + t / 2, -edge, 0, 0, 0]);
      posts.push([edge, y + h / 2 + t / 2, x, 0, 0, 0]);
      posts.push([-edge, y + h / 2 + t / 2, x, 0, 0, 0]);
    }
    instanced(new THREE.BoxGeometry(0.35, 1, 0.35), MAT.stucco, posts, parent, true, true);
    const railY = y + h + t / 2;
    box(ringW + 0.4, 0.16, 0.42, MAT.stone, 0, railY, edge, parent, true, true);
    box(ringW + 0.4, 0.16, 0.42, MAT.stone, 0, railY, -edge, parent, true, true);
    box(0.42, 0.16, ringW + 0.4, MAT.stone, edge, railY, 0, parent, true, true);
    box(0.42, 0.16, ringW + 0.4, MAT.stone, -edge, railY, 0, parent, true, true);
    // gold corner spires mark the gallery corners
    [[edge, edge], [edge, -edge], [-edge, edge], [-edge, -edge]].forEach((p) => {
      const base = mesh(new THREE.CylinderGeometry(0.28, 0.4, 0.45, 8), MAT.stone, p[0], railY + 0.2, p[1], parent, true, false);
      const spire = mesh(new THREE.ConeGeometry(0.26, 1.9, 6), MAT.gold, p[0], railY + 1.35, p[1], parent, true, false);
      spire.name = 'gallery-spire';
      const bead = mesh(new THREE.SphereGeometry(0.14, 6, 5), MAT.gold, p[0], railY + 2.35, p[1], parent, false, false);
    });
  }

  function addFinial(parent, y, scale) {
    const g = new THREE.Group();
    g.position.y = y;
    const s = scale;
    // lotus throne
    const lotus = mesh(new THREE.SphereGeometry(1.9 * s, 16, 10), MAT.gold, 0, 0.6 * s, 0, g, true, false);
    lotus.scale.y = 0.55;
    // rings
    for (let i = 0; i < 4; i++) {
      const ring = mesh(new THREE.TorusGeometry((1.55 - i * 0.25) * s, 0.14 * s, 6, 20), MAT.gold,
        0, (1.4 + i * 0.9) * s, 0, g, true, false);
      ring.rotation.x = Math.PI / 2;
    }
    // central spire
    mesh(new THREE.ConeGeometry(0.85 * s, 7.2 * s, 10), MAT.gold, 0, 5.2 * s, 0, g, true, false);
    // eight prongs (two rings)
    for (let ring = 0; ring < 2; ring++) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + (ring ? Math.PI / 8 : 0);
        const r = (ring ? 1.35 : 1.9) * s;
        const h = (ring ? 3.4 : 4.6) * s;
        const prong = mesh(new THREE.ConeGeometry(0.18 * s, h, 6), MAT.gold,
          Math.cos(a) * r, (ring ? 2.3 : 1.7) * s + h / 2, Math.sin(a) * r, g, true, false);
        prong.rotation.z = Math.cos(a) * 0.34;
        prong.rotation.x = -Math.sin(a) * 0.34;
      }
    }
    // crown tip
    mesh(new THREE.SphereGeometry(0.42 * s, 10, 8), MAT.gold, 0, 9.1 * s, 0, g, true, false);
    const trident = mesh(new THREE.ConeGeometry(0.16 * s, 2.4 * s, 6), MAT.gold, 0, 10.3 * s, 0, g, true, false);
    trident.name = 'finial-tip';
    parent.add(g);
    return g;
  }

  function buildPrangTower(opts) {
    const o = opts || {};
    const scale = o.scale || 1;
    const tiers = o.tiers || PRANG_TIERS;
    const parent = o.parent || groups.prang;
    const group = new THREE.Group();
    group.name = o.name || 'prang';
    group.position.set(o.x || 0, o.y === undefined ? TERRACE.y : o.y, o.z || 0);
    group.scale.setScalar(scale);
    parent.add(group);

    let y = 0;
    const panels = [];
    const panelFrames = [];
    const cornices = [];
    const goldBands = [];
    const buttresses = [];

    tiers.forEach((tier, i) => {
      const w = tier.w;
      const h = tier.h;
      const core = box(w, h, w, MAT.stucco, 0, y + h / 2, 0, group, true, true);
      core.name = 'prang-tier-' + i;
      // corner buttresses give the redented silhouette
      const bw = w * 0.16;
      const off = w / 2 + bw * 0.28;
      [[off, off], [off, -off], [-off, off], [-off, -off]].forEach((p) => {
        buttresses.push([p[0], y + h / 2, p[1], 0, 0, 0, bw, h, bw]);
      });
      // cornice bands
      if (i < tiers.length - 1) {
        cornices.push([0, y + h - 0.2, 0, 0, 0, 0, w + 1.1, 0.4, w + 1.1]);
        goldBands.push([0, y + h - 0.45, 0, 0, 0, 0, w + 1.16, 0.12, w + 1.16]);
        cornices.push([0, y + 0.2, 0, 0, 0, 0, w + 0.5, 0.24, w + 0.5]);
      }
      // porcelain niches on four faces
      if (tier.panel) {
        const pw = w * 0.52;
        const ph = Math.min(h * 0.58, w * 0.62);
        const py = y + h * 0.52;
        const d = w / 2 + 0.07;
        // east / west
        panels.push([d, py, 0, 0, Math.PI / 2, 0, pw, ph, 1]);
        panels.push([-d, py, 0, 0, -Math.PI / 2, 0, pw, ph, 1]);
        // north / south
        panels.push([0, py, d, 0, 0, 0, pw, ph, 1]);
        panels.push([0, py, -d, 0, Math.PI, 0, pw, ph, 1]);
        // dark recessed frame behind each porcelain panel
        const fd = d - 0.05;
        panelFrames.push([fd, py, 0, 0, Math.PI / 2, 0, pw + 0.7, ph + 0.6, 1]);
        panelFrames.push([-fd, py, 0, 0, -Math.PI / 2, 0, pw + 0.7, ph + 0.6, 1]);
        panelFrames.push([0, py, fd, 0, 0, 0, pw + 0.7, ph + 0.6, 1]);
        panelFrames.push([0, py, -fd, 0, Math.PI, 0, pw + 0.7, ph + 0.6, 1]);
        // gold lintel above each niche
        box(pw + 0.6, 0.16, 0.3, MAT.goldDark, 0, py + ph / 2 + 0.28, d + 0.04, group, false, false);
        // porcelain frieze around the tier foot
        box(w + 0.5, 0.34, w + 0.5, MAT.mosaicWall, 0, y + 0.45, 0, group, false, false);
        box(w + 0.72, 0.1, w + 0.72, MAT.goldDark, 0, y + 0.64, 0, group, false, false);
      }
      y += h;

      if (tier.ledge) {
        addGallery(group, w / 2, y, true, MAT.stuccoWarm);
        // mosaic frieze on the gallery face
        const frieze = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, 0.35), MAT.mosaicWall);
        frieze.position.set(0, y - 1.0, w / 2 + 1.5);
        group.add(frieze);
      }
    });

    instanced(new THREE.BoxGeometry(1, 1, 1), MAT.stuccoWarm, buttresses, group, true, true);
    instanced(new THREE.BoxGeometry(1, 1, 1), MAT.stuccoWarm, cornices, group, true, true);
    instanced(new THREE.BoxGeometry(1, 1, 1), MAT.gold, goldBands, group, false, false);

    if (panelFrames.length) {
      const back = instanced(new THREE.PlaneGeometry(1, 1), MAT.panelBack, panelFrames, group, false, false);
      if (back) back.name = 'porcelain-recess';
    }
    if (panels.length) {
      const im = instanced(new THREE.PlaneGeometry(1, 1), MAT.mosaic, panels, group, false, false);
      if (im) {
        im.name = 'porcelain-panels';
        im.userData.isMosaic = true;
      }
    }

    // base stairways (four faces) leading to the plinth
    const stairItems = [];
    const stairW = 6.4;
    const rise = tiers[0].h;
    for (let side = 0; side < 4; side++) {
      const a = (side * Math.PI) / 2;
      const nx = Math.sin(a), nz = Math.cos(a);
      const baseD = tiers[0].w / 2;
      for (let i = 0; i < 7; i++) {
        const t = (i + 0.5) / 7;
        const d = baseD + (1 - t) * 3.2;
        stairItems.push([
          nx * d + nz * 0, (rise * t) / 1.8, nz * d + nx * 0,
          0, a, 0, stairW, rise / 7, 0.7
        ]);
      }
    }
    instanced(new THREE.BoxGeometry(1, 1, 1), MAT.stone, stairItems, group, true, true);

    // steep pilgrim staircases hugging the four faces
    const steep = [];
    for (let side = 0; side < 4; side++) {
      const a = (side * Math.PI) / 2;
      for (let i = 0; i < 22; i++) {
        const yy = 2.9 + i * 0.48;
        const faceR = 10.9 - i * 0.058;
        steep.push([
          Math.sin(a) * faceR, yy, Math.cos(a) * faceR,
          0, a, 0, 2.5, 0.22, 0.55
        ]);
      }
    }
    instanced(new THREE.BoxGeometry(1, 1, 1), MAT.stone, steep, group, true, true);
    // stair cheeks
    for (let side = 0; side < 4; side++) {
      const a = (side * Math.PI) / 2;
      const cheek = box(0.24, 10.4, 0.5, MAT.stuccoWarm,
        Math.sin(a) * 10.85 + Math.cos(a) * 1.35, 7.9, Math.cos(a) * 10.85 - Math.sin(a) * 1.35, group, false, true);
      cheek.rotation.y = a;
      const cheek2 = cheek.clone();
      cheek2.position.set(Math.sin(a) * 10.85 - Math.cos(a) * 1.35, 7.9, Math.cos(a) * 10.85 + Math.sin(a) * 1.35);
      group.add(cheek2);
    }

    // gilded devotee figures standing in the lowest porcelain niches
    if (o.figures) {
      const t1 = tiers[1];
      const faceY = tiers[0].h + t1.h * 0.32;
      const fd = t1.w / 2 + 0.42;
      for (let side = 0; side < 4; side++) {
        const a = (side * Math.PI) / 2;
        const fg = new THREE.Group();
        fg.position.set(Math.sin(a) * fd, faceY, Math.cos(a) * fd);
        fg.rotation.y = a;
        box(1.1, 0.16, 0.5, MAT.goldDark, 0, 0, 0, fg, false, false);
        const body = mesh(new THREE.ConeGeometry(0.32, 1.05, 8), MAT.gold, 0, 0.58, 0.05, fg, true, false);
        body.name = 'niche-figure';
        mesh(new THREE.SphereGeometry(0.14, 8, 6), MAT.gold, 0, 1.18, 0.05, fg, false, false);
        mesh(new THREE.ConeGeometry(0.16, 0.45, 6), MAT.gold, 0, 1.42, 0.05, fg, false, false);
        group.add(fg);
      }
    }

    const topY = y;
    addFinial(group, topY, scale * 1.02);
    group.userData.height = (topY + 11.5) * scale;
    group.userData.topY = topY;
    return group;
  }

  function buildIndraNiche(parent) {
    const g = new THREE.Group();
    g.position.set(5.58, 33.1, 0);
    g.rotation.y = Math.PI / 2;
    g.name = 'indra-niche';

    // recessed niche and gold frame
    box(3.9, 3.5, 0.18, MAT.panelBack, 0, 1.7, -0.05, g, false, false);
    box(4.1, 0.18, 0.5, MAT.gold, 0, 3.5, 0.15, g, false, false);
    box(0.18, 3.5, 0.5, MAT.gold, -2.0, 1.75, 0.15, g, false, false);
    box(0.18, 3.5, 0.5, MAT.gold, 2.0, 1.75, 0.15, g, false, false);
    const halo = mesh(new THREE.TorusGeometry(1.1, 0.09, 6, 24), MAT.gold, 0, 1.9, 0.18, g, false, false);
    halo.name = 'indra-halo';

    // Erawan, the three-headed elephant
    const body = mesh(new THREE.SphereGeometry(0.85, 12, 10), MAT.gold, 0, 0.95, 0.18, g, true, false);
    body.scale.set(1.05, 0.82, 0.75);
    [[-0.45, 0.25], [0.45, 0.25], [-0.45, -0.35], [0.45, -0.35]].forEach((p) => {
      mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.8, 6), MAT.gold, p[0], 0.4, p[1], g, false, false);
    });
    [-0.42, 0, 0.42].forEach((hx, i) => {
      const head = mesh(new THREE.SphereGeometry(0.3, 10, 8), MAT.gold, hx, 1.42 - Math.abs(i - 1) * 0.12, 0.62, g, true, false);
      head.scale.set(0.9, 1, 0.95);
      const trunk = mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.85, 6), MAT.gold, hx, 0.98, 0.85, g, false, false);
      trunk.rotation.x = -0.5 + i * 0.08;
      const tusk = mesh(new THREE.ConeGeometry(0.04, 0.3, 5), MAT.stucco, hx + 0.12, 1.2, 0.86, g, false, false);
      tusk.rotation.x = 2.6;
    });
    [-0.6, 0.6].forEach((ex) => {
      const ear = mesh(new THREE.SphereGeometry(0.34, 8, 6), MAT.gold, ex, 1.5, 0.42, g, false, false);
      ear.scale.set(1.1, 0.85, 0.35);
    });
    // Indra, seated above
    mesh(new THREE.CylinderGeometry(0.3, 0.42, 1.0, 8), MAT.gold, 0, 2.35, 0.12, g, false, false);
    mesh(new THREE.SphereGeometry(0.24, 10, 8), MAT.gold, 0, 3.0, 0.12, g, false, false);
    for (let i = 0; i < 3; i++) {
      const crown = mesh(new THREE.ConeGeometry(0.24 - i * 0.05, 0.22, 7), MAT.gold, 0, 3.22 + i * 0.18, 0.12, g, false, false);
      crown.name = 'indra-crown-' + i;
    }
    const vajra = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 5), MAT.gold, 0.55, 3.0, 0.3, g, false, false);
    vajra.rotation.z = -0.35;
    mesh(new THREE.SphereGeometry(0.11, 6, 5), MAT.gold, 0.7, 3.45, 0.3, g, false, false);
    mesh(new THREE.SphereGeometry(0.11, 6, 5), MAT.gold, 0.4, 2.55, 0.3, g, false, false);

    // porcelain petals around the shrine
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const p = mesh(new THREE.SphereGeometry(0.1, 6, 5), MAT.mosaic, Math.cos(a) * 1.75, 1.8 + Math.sin(a) * 1.6, 0.2, g, false, false);
      p.scale.set(1, 0.7, 0.4);
    }

    parent.add(g);
    return g;
  }

  function buildCentralPrang() {
    const g = buildPrangTower({
      parent: groups.prang,
      scale: 1.15,
      name: 'central-prang',
      figures: true,
      x: 0, z: 0
    });
    centralPrang = g;
    buildIndraNiche(g);
    // offering pedestals at the base
    [-1, 1].forEach((s) => {
      const ped = new THREE.Group();
      ped.position.set(s * 10.5, TERRACE.y, 15.6);
      box(1.5, 1.1, 1.5, MAT.stone, 0, 0.55, 0, ped, true, true);
      mesh(new THREE.ConeGeometry(0.34, 2.0, 8), MAT.gold, 0, 2.0, 0, ped, true, false);
      groups.prang.add(ped);
    });
    addCircle(0, 0, 14.2);
  }

  /* ------------------------------------------------------------------ */
  /* 13. Satellite prangs and mondops                                   */
  /* ------------------------------------------------------------------ */
  const SMALL_TIERS = [
    { w: 13.0, h: 1.8 },
    { w: 11.0, h: 4.0, panel: true },
    { w: 9.2, h: 3.0, ledge: true },
    { w: 7.6, h: 4.2, panel: true },
    { w: 5.8, h: 3.2 },
    { w: 4.0, h: 3.0 }
  ];

  function buildSatellitePrang(x, z, i) {
    const g = buildPrangTower({
      parent: groups.satellites,
      scale: 0.74,
      tiers: SMALL_TIERS,
      name: 'satellite-prang-' + (i + 1),
      x, z
    });
    buildStats.satellites++;
    addCircle(x, z, 5.4);
    return g;
  }

  function buildMondop(x, z, i) {
    const g = new THREE.Group();
    g.position.set(x, TERRACE.y, z);
    g.name = 'mondop-' + (i + 1);
    groups.mondops.add(g);

    box(7.2, 1.6, 7.2, MAT.stoneDark, 0, 0.8, 0, g, true, true);
    box(6.6, 0.25, 6.6, MAT.mosaicWall, 0, 1.7, 0, g, false, true);
    // four columns
    [[2.5, 2.5], [2.5, -2.5], [-2.5, 2.5], [-2.5, -2.5]].forEach((p) => {
      const c = mesh(new THREE.CylinderGeometry(0.3, 0.34, 4.4, 10), MAT.stucco, p[0], 3.9, p[1], g, true, true);
      c.name = 'mondop-column';
    });
    // shrine cube
    box(4.2, 3.0, 4.2, MAT.stucco, 0, 4.2, 0, g, true, true);
    // niches
    const nicheMat = MAT.mosaic;
    [[2.11, 0, 0, Math.PI / 2], [-2.11, 0, 0, -Math.PI / 2], [0, 0, 2.11, 0], [0, 0, -2.11, Math.PI]].forEach((p) => {
      const n = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.1), nicheMat);
      n.position.set(p[0], 4.3, p[2]);
      n.rotation.y = p[3];
      g.add(n);
    });
    // roof
    box(5.4, 0.35, 5.4, MAT.roof, 0, 5.85, 0, g, true, true);
    const roof = mesh(new THREE.ConeGeometry(4.2, 2.0, 4), MAT.roof, 0, 6.9, 0, g, true, true);
    roof.rotation.y = Math.PI / 4;
    const fin = mesh(new THREE.ConeGeometry(0.42, 2.6, 6), MAT.gold, 0, 8.9, 0, g, true, true);
    fin.name = 'mondop-finial';
    mesh(new THREE.SphereGeometry(0.3, 8, 6), MAT.gold, 0, 10.35, 0, g, true, false);
    // little stairs facing the prang
    const dir = x === 0 && z < 0 ? 1 : -1;
    const st = box(2.0, 0.9, 1.2, MAT.stone, 0, 0.45, dir * 4.1, g, true, true);
    st.rotation.x = 0;

    buildStats.mondops++;
    addCircle(x, z, 3.7);
    return g;
  }

  /* ------------------------------------------------------------------ */
  /* 14. Ubosot, yaksha guardians and gate                              */
  /* ------------------------------------------------------------------ */
  function buildYaksha(x, z, kind) {
    const isGreen = kind === 'green';
    const bodyMat = isGreen ? MAT.yakshaGreen : MAT.yakshaWhite;
    const trimMat = isGreen ? MAT.gold : MAT.goldDark;
    const g = new THREE.Group();
    g.position.set(x, TERRACE.y, z);
    g.name = isGreen ? 'yaksha-thotsakan' : 'yaksha-sahassa';
    g.rotation.y = Math.PI / 2; // face east (+x)
    g.scale.setScalar(0.82);
    groups.ubosot.add(g);

    // pedestal
    box(3.6, 0.5, 3.6, MAT.stoneDark, 0, 0.25, 0, g, true, true);
    box(3.0, 1.1, 3.0, MAT.stucco, 0, 1.05, 0, g, true, true);
    box(3.2, 0.18, 3.2, trimMat, 0, 1.65, 0, g, true, false);

    const baseY = 1.75;
    // feet
    [[-0.55, 0], [0.55, 0]].forEach((p) => {
      box(0.62, 0.35, 1.1, MAT.dark, p[0], baseY + 0.17, 0.22, g, true, true);
      const shin = mesh(new THREE.CylinderGeometry(0.3, 0.38, 1.7, 8), bodyMat, p[0], baseY + 1.1, 0, g, true, true);
      shin.name = 'yaksha-shin';
      // greave
      box(0.7, 0.95, 0.55, trimMat, p[0], baseY + 1.25, 0.05, g, true, true);
    });
    // skirt / sampot
    const skirt = mesh(new THREE.CylinderGeometry(1.05, 1.35, 1.5, 10), bodyMat, 0, baseY + 2.35, 0, g, true, true);
    skirt.scale.z = 0.8;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p = box(0.28, 1.5, 0.12, trimMat, Math.cos(a) * 1.1, baseY + 2.3, Math.sin(a) * 0.88, g, false, false);
      p.rotation.y = -a;
    }
    // belt
    box(2.35, 0.4, 1.9, trimMat, 0, baseY + 3.05, 0, g, true, true);
    // torso
    const torso = mesh(new THREE.CylinderGeometry(1.0, 1.25, 2.0, 10), bodyMat, 0, baseY + 4.0, 0, g, true, true);
    torso.scale.z = 0.72;
    // breastplate
    box(2.1, 1.25, 0.55, trimMat, 0, baseY + 4.2, 0.62, g, true, true);
    box(1.5, 0.5, 0.2, MAT.yakshaDark, 0, baseY + 4.15, 0.92, g, false, false);
    // shoulders
    [-1.35, 1.35].forEach((sx) => {
      const sh = mesh(new THREE.SphereGeometry(0.62, 10, 8), bodyMat, sx, baseY + 4.85, 0, g, true, true);
      sh.scale.y = 0.85;
      const pauldron = mesh(new THREE.ConeGeometry(0.72, 0.55, 6), trimMat, sx, baseY + 5.1, 0, g, true, true);
      pauldron.rotation.z = sx > 0 ? -0.4 : 0.4;
    });
    // arms
    const armL = mesh(new THREE.CylinderGeometry(0.26, 0.22, 1.7, 8), bodyMat, -1.55, baseY + 3.9, 0.1, g, true, true);
    armL.rotation.z = 0.28;
    const armR = mesh(new THREE.CylinderGeometry(0.26, 0.22, 1.7, 8), bodyMat, 1.55, baseY + 3.9, 0.1, g, true, true);
    armR.rotation.z = -0.28;
    // bracers
    box(0.5, 0.7, 0.5, trimMat, -1.77, baseY + 3.2, 0.12, g, true, true);
    box(0.5, 0.7, 0.5, trimMat, 1.77, baseY + 3.2, 0.12, g, true, true);
    // hands
    mesh(new THREE.SphereGeometry(0.28, 8, 6), bodyMat, -1.9, baseY + 2.75, 0.15, g, true, false);
    mesh(new THREE.SphereGeometry(0.28, 8, 6), bodyMat, 1.9, baseY + 2.75, 0.15, g, true, false);
    // club in right hand
    const club = mesh(new THREE.CylinderGeometry(0.14, 0.2, 4.6, 8), MAT.stoneDark, 2.15, baseY + 2.9, 0.2, g, true, true);
    club.rotation.z = 0.06;
    const clubHead = mesh(new THREE.SphereGeometry(0.55, 10, 8), trimMat, 2.3, baseY + 5.1, 0.2, g, true, true);
    clubHead.scale.y = 1.3;
    // neck
    box(0.7, 0.45, 0.6, trimMat, 0, baseY + 5.15, 0, g, true, true);
    // head
    const head = mesh(new THREE.SphereGeometry(0.72, 12, 10), bodyMat, 0, baseY + 5.9, 0, g, true, true);
    head.scale.set(0.95, 1.15, 0.95);
    // eyes
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffcf6b, emissive: 0xff9a2e, emissiveIntensity: 1.2, roughness: 0.4 });
    [-0.24, 0.24].forEach((ex) => {
      mesh(new THREE.SphereGeometry(0.09, 8, 6), eyeMat, ex, baseY + 6.0, 0.63, g, false, false);
    });
    // fangs
    [-0.18, 0.18].forEach((fx) => {
      const fang = mesh(new THREE.ConeGeometry(0.05, 0.26, 5), MAT.stucco, fx, baseY + 5.52, 0.62, g, false, false);
      fang.rotation.x = Math.PI;
    });
    // crown (tiered)
    for (let i = 0; i < 4; i++) {
      const r = 0.78 - i * 0.12;
      const crown = mesh(new THREE.ConeGeometry(r, 0.46, 8), trimMat, 0, baseY + 6.55 + i * 0.34, 0, g, true, false);
      crown.rotation.y = i * 0.2;
    }
    const crownTip = mesh(new THREE.ConeGeometry(0.16, 1.5, 6), trimMat, 0, baseY + 8.05, 0, g, true, false);
    crownTip.name = 'yaksha-crown';
    // ear ornaments
    [-0.72, 0.72].forEach((ex) => {
      box(0.16, 0.6, 0.3, trimMat, ex, baseY + 5.85, 0, g, false, false);
    });

    buildStats.yakshas++;
    addCircle(x, z, 1.5);
    return g;
  }

  function buildChofah(x, y, z, flip) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const horn = mesh(new THREE.TorusGeometry(0.95, 0.16, 6, 16, Math.PI * 0.95), MAT.gold, 0, 0, 0, g, true, false);
    horn.rotation.z = flip ? Math.PI : 0;
    horn.rotation.y = Math.PI / 2;
    const tip = mesh(new THREE.ConeGeometry(0.2, 1.1, 6), MAT.gold, flip ? 0.95 : -0.95, 0.3, 0, g, true, false);
    tip.rotation.z = flip ? -0.6 : 0.6;
    return g;
  }

  function buildUbosot() {
    const g = new THREE.Group();
    g.name = 'ubosot';
    groups.ubosot.add(g);

    const CX = -34, CZ = 0;
    const W = 26, D = 15;
    const PLAT = 1.4;
    const baseY = TERRACE.y;

    // platform
    box(W + 4.5, PLAT, D + 4.5, MAT.stoneDark, CX, baseY + PLAT / 2, CZ, g, true, true);
    box(W + 3.6, 0.2, D + 3.6, MAT.mosaicWall, CX, baseY + PLAT + 0.02, CZ, g, false, true);

    const wallY = baseY + PLAT;
    const WALL_H = 8.6;
    // walls
    box(W, WALL_H, D, MAT.stucco, CX, wallY + WALL_H / 2, CZ, g, true, true);
    // mosaic frieze band
    box(W + 0.12, 1.2, D + 0.12, MAT.mosaicWall, CX, wallY + WALL_H - 1.4, CZ, g, false, false);
    // pilasters
    for (let i = -5; i <= 5; i++) {
      box(0.7, WALL_H, 0.35, MAT.stuccoWarm, CX + i * 2.4, wallY + WALL_H / 2, CZ + D / 2, g, true, true);
      box(0.7, WALL_H, 0.35, MAT.stuccoWarm, CX + i * 2.4, wallY + WALL_H / 2, CZ - D / 2, g, true, true);
    }

    // front (east) doors
    for (let i = -1; i <= 1; i++) {
      const door = box(2.1, 4.4, 0.18, MAT.door, CX + W / 2 + 0.02, wallY + 2.4, CZ + i * 3.6, g, false, false);
      door.rotation.y = Math.PI / 2;
      box(2.5, 0.28, 0.36, MAT.gold, CX + W / 2 + 0.1, wallY + 4.75, CZ + i * 3.6, g, false, false);
      box(0.28, 4.7, 0.36, MAT.goldDark, CX + W / 2 + 0.1, wallY + 2.4, CZ + i * 3.6 - 1.2, g, false, false);
      box(0.28, 4.7, 0.36, MAT.goldDark, CX + W / 2 + 0.1, wallY + 2.4, CZ + i * 3.6 + 1.2, g, false, false);
    }
    // windows
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      const win = box(0.15, 2.2, 1.5, MAT.dark, CX + W / 2 + 0.02, wallY + 5.6, CZ + i * 2.6, g, false, false);
      win.rotation.y = Math.PI / 2;
      box(0.2, 2.5, 1.8, MAT.goldDark, CX + W / 2 + 0.06, wallY + 5.6, CZ + i * 2.6, g, false, false).scale.set(0.35, 1, 1);
    }

    // porch columns
    for (let i = -2; i <= 2; i++) {
      const c = mesh(new THREE.CylinderGeometry(0.32, 0.36, 5.6, 10), MAT.stucco, CX + W / 2 + 2.2, wallY + 2.8, CZ + i * 3.0, g, true, true);
      c.name = 'ubosot-column';
      box(0.9, 0.3, 0.9, MAT.stoneDark, CX + W / 2 + 2.2, wallY + 0.2, CZ + i * 3.0, g, false, true);
    }
    // porch roof
    box(6.5, 0.3, 15.5, MAT.roof, CX + W / 2 + 1.8, wallY + 5.9, CZ, g, true, true);

    // main roof
    const ridgeY = wallY + WALL_H + 5.4;
    const slopeLen = 10.4;
    [-1, 1].forEach((s) => {
      const slope = box(W + 4.4, 0.45, slopeLen, MAT.roof, CX, ridgeY - 2.55, CZ + s * 4.35, g, true, true);
      slope.rotation.x = s * 0.55;
    });
    box(W + 5.2, 0.7, 1.0, MAT.stuccoWarm, CX, ridgeY + 0.15, CZ, g, true, true);
    box(W + 2.2, 0.35, 20.5, MAT.stuccoWarm, CX, wallY + WALL_H + 0.2, CZ, g, false, true);

    // gable ends
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-7.6, 0);
    gableShape.lineTo(7.6, 0);
    gableShape.lineTo(0, 5.6);
    gableShape.closePath();
    const gableGeo = new THREE.ShapeGeometry(gableShape);
    [-1, 1].forEach((s) => {
      const gable = new THREE.Mesh(gableGeo, MAT.stuccoWarm);
      gable.position.set(CX + s * (W / 2 + 0.25), wallY + WALL_H + 0.1, CZ);
      gable.rotation.y = s * Math.PI / 2;
      gable.castShadow = true;
      g.add(gable);
    });

    // chofah finials at the ridge ends
    [-1, 1].forEach((s) => {
      const ch = buildChofah(CX + s * (W / 2 + 1.9), ridgeY + 0.8, CZ, s > 0);
      g.add(ch);
    });
    // gold ridge ornaments
    for (let i = -2; i <= 2; i++) {
      mesh(new THREE.SphereGeometry(0.22, 8, 6), MAT.gold, CX + i * 4.6, ridgeY + 0.68, CZ, g, false, false);
    }

    // entrance steps and naga rails
    box(4.2, 0.35, 12.5, MAT.stone, CX + W / 2 + 4.0, wallY + 0.17, CZ, g, true, true);
    box(4.2, 0.35, 12.5, MAT.stone, CX + W / 2 + 5.6, baseY + 0.35, CZ, g, true, true);
    box(4.2, 0.35, 12.5, MAT.stone, CX + W / 2 + 7.0, baseY + 0.05, CZ, g, true, true);

    // yaksha guardians
    buildYaksha(CX + W / 2 + 3.6, 7.2, 'green');
    buildYaksha(CX + W / 2 + 3.6, -7.2, 'white');

    addBoxCollider(CX - W / 2 - 2.4, CX + W / 2 + 3.0, -D / 2 - 2.4, D / 2 + 2.4);
    return g;
  }

  /* ------------------------------------------------------------------ */
  /* 15. Promenade, salas, lanterns                                     */
  /* ------------------------------------------------------------------ */
  function buildSala(x, z, i) {
    const g = new THREE.Group();
    g.position.set(x, BOARDWALK.y, z);
    g.name = 'sala-' + (i + 1);
    groups.promenade.add(g);

    box(7.2, 0.55, 7.2, MAT.stoneDark, 0, 0.27, 0, g, true, true);
    box(6.4, 0.16, 6.4, MAT.granite, 0, 0.62, 0, g, false, true);

    // steps to the river side
    for (let s = 0; s < 3; s++) {
      box(4.4, 0.18, 0.75, MAT.stone, 0, -0.1 - s * 0.18, 3.6 + s * 0.7, g, false, true);
    }

    // four green granite columns
    const cols = [];
    [[2.35, 2.35], [2.35, -2.35], [-2.35, 2.35], [-2.35, -2.35]].forEach((p) => {
      cols.push([p[0], 2.4, p[1], 0, 0, 0, 1, 1, 1]);
    });
    instanced(new THREE.CylinderGeometry(0.24, 0.27, 3.6, 10), MAT.granite, cols, g, true, true);

    // beams
    box(5.6, 0.32, 0.4, MAT.granite, 0, 4.3, 2.35, g, true, true);
    box(5.6, 0.32, 0.4, MAT.granite, 0, 4.3, -2.35, g, true, true);
    box(0.4, 0.32, 5.6, MAT.granite, 2.35, 4.3, 0, g, true, true);
    box(0.4, 0.32, 5.6, MAT.granite, -2.35, 4.3, 0, g, true, true);

    // low stone bench and railing on three sides
    box(1.1, 0.35, 4.4, MAT.granite, -2.6, 0.8, 0, g, true, true);
    [[0, 2.85], [-1.6, 2.85], [1.6, 2.85]].forEach((p) => {
      box(0.16, 0.85, 0.16, MAT.granite, p[0], 1.15, p[1], g, true, true);
    });
    box(5.9, 0.14, 0.2, MAT.granite, 0, 1.6, 2.85, g, true, true);

    // two-tier Chinese roof
    box(7.6, 0.28, 7.6, MAT.roof, 0, 4.55, 0, g, true, true);
    const roof = mesh(new THREE.ConeGeometry(5.5, 1.8, 4), MAT.roof, 0, 5.55, 0, g, true, true);
    roof.rotation.y = Math.PI / 4;
    // upturned eave tips
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach((p) => {
      const tip = mesh(new THREE.ConeGeometry(0.16, 1.5, 6), MAT.goldDark, p[0] * 4.5, 4.85, p[1] * 4.5, g, true, false);
      tip.rotation.z = -p[0] * 0.75;
      tip.rotation.x = p[1] * 0.75;
    });
    mesh(new THREE.SphereGeometry(0.4, 10, 8), MAT.gold, 0, 6.7, 0, g, true, false);
    const fin = mesh(new THREE.ConeGeometry(0.22, 1.5, 6), MAT.gold, 0, 7.5, 0, g, true, false);
    fin.name = 'sala-finial';

    // hanging lantern
    const lantern = mesh(new THREE.SphereGeometry(0.3, 10, 8), MAT.lampGlass, 0, 3.7, 0, g, false, false);
    lantern.scale.y = 1.25;
    animated.lanterns.push(lantern);
    mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 4), MAT.goldDark, 0, 4.2, 0, g, false, false);

    buildStats.salas++;
    addCircle(x, z, 3.4);
    return g;
  }

  function buildLanternPost(x, z, i) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    groups.promenade.add(g);
    mesh(new THREE.CylinderGeometry(0.13, 0.18, 4.6, 8), MAT.stoneDark, 0, 2.3, 0, g, true, true);
    box(0.9, 0.16, 0.16, MAT.goldDark, 0, 4.55, 0, g, true, false);
    const lamp = mesh(new THREE.SphereGeometry(0.3, 10, 8), MAT.lampGlass, 0.45, 4.3, 0, g, false, false);
    lamp.scale.y = 1.3;
    animated.lanterns.push(lamp);
    const cap = mesh(new THREE.ConeGeometry(0.36, 0.35, 6), MAT.goldDark, 0.45, 4.65, 0, g, false, false);
    cap.name = 'lantern-cap-' + i;
    addCircle(x, z, 0.5);
    return g;
  }

  function buildPromenade() {
    // six green granite salas
    const zs = [-36, -24, -12, 12, 24, 36];
    zs.forEach((z, i) => buildSala(47.4, z, i));

    // river railing with stone posts
    const posts = [];
    for (let z = -48; z <= 48; z += 3.2) posts.push([BOARDWALK.maxX - 0.35, 1.25, z, 0, 0, 0, 0.2, 1.1, 0.2]);
    instanced(new THREE.BoxGeometry(1, 1, 1), MAT.stoneDark, posts, groups.promenade, true, true);
    box(0.22, 0.18, 98, MAT.stoneDark, BOARDWALK.maxX - 0.35, 1.85, 0, groups.promenade, true, true);
    box(0.16, 0.12, 98, MAT.stoneDark, BOARDWALK.maxX - 0.35, 1.4, 0, groups.promenade, true, true);

    // lamp posts between salas
    [-36, -24, -12, 12, 24, 36].forEach((z, i) => buildLanternPost(45.0, z, i));

    // stone landing steps down to the water (decorative)
    for (let s = 0; s < 5; s++) {
      box(2.4, 0.2, 7.0, MAT.stoneDark, BOARDWALK.maxX + 0.2 + s * 0.45, 0.55 - s * 0.24, 0, groups.promenade, false, true);
    }

    // stone lanterns flanking the ramp
    [-1, 1].forEach((s) => {
      const g = new THREE.Group();
      g.position.set(38.6, TERRACE.y, s * 10.2);
      box(1.1, 0.55, 1.1, MAT.stoneDark, 0, 0.28, 0, g, true, true);
      mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.3, 8), MAT.stone, 0, 1.2, 0, g, true, true);
      box(0.9, 0.55, 0.9, MAT.stone, 0, 2.05, 0, g, true, true);
      const lamp = mesh(new THREE.SphereGeometry(0.24, 8, 6), MAT.lampGlass, 0, 2.42, 0, g, false, false);
      lamp.scale.y = 1.1;
      animated.lanterns.push(lamp);
      const cap = mesh(new THREE.ConeGeometry(0.75, 0.5, 4), MAT.roof, 0, 2.85, 0, g, true, true);
      cap.rotation.y = Math.PI / 4;
      groups.promenade.add(g);
      addCircle(38.6, s * 10.2, 0.7);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 16. Water, boats, gardens                                          */
  /* ------------------------------------------------------------------ */
  function buildWater() {
    const geo = new THREE.PlaneGeometry(900, 1000, 1, 1);
    const water = new THREE.Mesh(geo, MAT.water);
    water.rotation.x = -Math.PI / 2;
    water.position.set(RIVER_X + 430, -0.55, 0);
    water.receiveShadow = false;
    water.name = 'chao-phraya-water';
    groups.water.add(water);
    animated.water = water;

    // a darker depth plane to hide the seam at the wall
    const deep = new THREE.Mesh(new THREE.PlaneGeometry(1300, 1400), new THREE.MeshBasicMaterial({ color: 0x061019 }));
    deep.rotation.x = -Math.PI / 2;
    deep.position.set(RIVER_X + 400, -1.4, 0);
    groups.water.add(deep);

    // shimmering path of light from the illuminated prang
    const glowCanvas = makeCanvas(128, 512);
    const gc = glowCanvas.getContext('2d');
    const gg = gc.createLinearGradient(0, 0, 0, 512);
    gg.addColorStop(0, 'rgba(255,255,255,0)');
    gg.addColorStop(0.35, 'rgba(255,255,255,.35)');
    gg.addColorStop(0.6, 'rgba(255,255,255,.5)');
    gg.addColorStop(1, 'rgba(255,255,255,0)');
    gc.fillStyle = gg;
    gc.fillRect(0, 0, 128, 512);
    for (let i = 0; i < 90; i++) {
      gc.fillStyle = 'rgba(255,255,255,' + (0.04 + Math.random() * 0.14) + ')';
      const y = Math.random() * 512;
      gc.fillRect(Math.random() * 110, y, 6 + Math.random() * 18, 1 + Math.random() * 2.5);
    }
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    glowTex.encoding = THREE.sRGBEncoding;
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTex, color: 0xffc46b, transparent: true, opacity: 0.1,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(46, 190), glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(RIVER_X + 40, -0.48, 0);
    glow.name = 'prang-reflection';
    groups.water.add(glow);
    animated.glow = glow;
  }

  function buildBoat(z, offset, scale, paint) {
    const g = new THREE.Group();
    g.position.set(64 + offset, -0.42, z);
    g.scale.setScalar(scale);
    g.name = 'longtail-boat';
    g.rotation.y = Math.PI / 2;
    const hull = mesh(new THREE.CylinderGeometry(0.9, 0.55, 9, 8, 1, false), paint ? MAT.boatPaint : MAT.boatWood, 0, 0.4, 0, g, true, false);
    hull.rotation.z = Math.PI / 2;
    hull.scale.set(1, 1, 0.42);
    const bow = mesh(new THREE.ConeGeometry(0.62, 4.2, 8), paint ? MAT.boatPaint : MAT.boatWood, 6.3, 0.55, 0, g, true, false);
    bow.rotation.z = -Math.PI / 2;
    // canopy
    box(3.2, 0.18, 1.9, MAT.roof, 0, 2.1, 0, g, false, false);
    [[-1.4, 1], [-1.4, -1], [1.4, 1], [1.4, -1]].forEach((p) => {
      mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.7, 4), MAT.goldDark, p[0], 1.3, p[1] * 0.8, g, false, false);
    });
    // long-tail motor shaft
    const shaft = mesh(new THREE.CylinderGeometry(0.07, 0.07, 5.2, 6), MAT.dark, -7.5, 0.9, 0, g, false, false);
    shaft.rotation.z = -0.28;
    // waterline foam
    const foam = mesh(new THREE.PlaneGeometry(10, 2.4), new THREE.MeshBasicMaterial({
      color: 0xdcefff, transparent: true, opacity: 0.18, depthWrite: false
    }), 0, 0.02, 0, g, false, false);
    foam.rotation.x = -Math.PI / 2;

    groups.boats.add(g);
    animated.boats.push({
      group: g,
      baseZ: z,
      baseX: 64 + offset,
      speed: 0.4 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      dir: Math.random() > 0.5 ? 1 : -1
    });
    return g;
  }

  function buildBoats() {
    buildBoat(-34, 6, 1.05, false);
    buildBoat(8, 14, 0.9, true);
    buildBoat(38, 4, 1.15, false);
  }

  const aoTexture = (() => {
    const c = makeCanvas(128, 128);
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,.85)');
    g.addColorStop(0.45, 'rgba(0,0,0,.45)');
    g.addColorStop(0.78, 'rgba(0,0,0,.12)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();

  function addAODisc(x, z, r, y, opacity) {
    const mat = new THREE.MeshBasicMaterial({
      map: aoTexture, transparent: true, depthWrite: false,
      opacity: opacity === undefined ? 0.4 : opacity
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y + 0.025, z);
    m.renderOrder = 1;
    groups.ground.add(m);
    return m;
  }

  function buildContactShadows() {
    addAODisc(0, 0, 24, TERRACE.y, 0.24);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      addAODisc(Math.cos(a) * 20.4, Math.sin(a) * 20.4, 8.5, TERRACE.y, 0.22);
      addAODisc(Math.cos(a) * 33.0, Math.sin(a) * 33.0, 6.5, TERRACE.y, 0.2);
    }
    addAODisc(-34, 0, 19, TERRACE.y, 0.22);
    [-36, -24, -12, 12, 24, 36].forEach((z) => addAODisc(47.4, z, 6.2, BOARDWALK.y, 0.32));
  }

  function buildGate() {
    const g = new THREE.Group();
    g.position.set(36.2, TERRACE.y, 0);
    g.name = 'river-gate';
    groups.terrace.add(g);

    // slender piers frame the approach without blocking the prang
    [-6.6, 6.6].forEach((z) => {
      box(1.3, 0.9, 1.3, MAT.stoneDark, 0.4, 0.45, z, g, true, true);
      box(0.95, 5.0, 0.95, MAT.stucco, 0.4, 2.9, z, g, true, true);
      box(1.15, 0.22, 1.15, MAT.gold, 0.4, 5.45, z, g, true, false);
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 3.3), MAT.mosaic);
      panel.position.set(0.9, 3.0, z);
      panel.rotation.y = Math.PI / 2;
      g.add(panel);
      addCircle(36.6, z, 0.8);
    });

    // slim lintel with a small prang crown
    box(1.2, 0.36, 14.4, MAT.stucco, 0.4, 5.92, 0, g, true, true);
    box(1.45, 0.12, 14.8, MAT.gold, 0.4, 6.13, 0, g, false, false);

    const crown = new THREE.Group();
    crown.position.set(0.4, 6.2, 0);
    box(3.4, 1.3, 3.4, MAT.stucco, 0, 0.65, 0, crown, true, true);
    box(2.4, 1.1, 2.4, MAT.stucco, 0, 1.85, 0, crown, true, true);
    box(1.5, 0.9, 1.5, MAT.stucco, 0, 2.85, 0, crown, true, true);
    box(3.5, 0.12, 3.5, MAT.gold, 0, 1.35, 0, crown, false, false);
    box(2.5, 0.1, 2.5, MAT.gold, 0, 2.45, 0, crown, false, false);
    mesh(new THREE.ConeGeometry(0.45, 1.4, 8), MAT.gold, 0, 4.0, 0, crown, true, false);
    mesh(new THREE.SphereGeometry(0.2, 8, 6), MAT.gold, 0, 4.85, 0, crown, false, false);
    g.add(crown);

    // naga rails down the ramp
    [-8.1, 8.1].forEach((z) => {
      const rail = box(5.6, 0.5, 0.42, MAT.stone, 2.7, -0.55, z, g, true, true);
      rail.rotation.z = 0.14;
      const head = mesh(new THREE.SphereGeometry(0.3, 8, 6), MAT.goldDark, 5.3, 0.25, z, g, true, false);
      head.scale.set(1.3, 0.9, 0.9);
    });

    [-6.6, 6.6].forEach((z) => {
      const lamp = mesh(new THREE.SphereGeometry(0.18, 8, 6), MAT.lampGlass, 1.0, 4.9, z, g, false, false);
      animated.lanterns.push(lamp);
    });
  }

  function buildMonks() {
    const robe = new THREE.MeshStandardMaterial({ color: 0xd97a2b, roughness: 0.88, metalness: 0.02 });
    const robeDark = new THREE.MeshStandardMaterial({ color: 0xb35a16, roughness: 0.9, metalness: 0.02 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xd8a878, roughness: 0.8, metalness: 0.02 });
    const spots = [
      [30.5, 5.2, 0.5], [29.0, 6.6, -0.3], [-12.0, 5.5, 1.9],
      [18.5, -6.2, 0.2], [6.0, -20.0, -1.2], [-26.0, -14.0, 0.8], [33.0, -16.0, 2.2]
    ];
    spots.forEach((p, i) => {
      const g = new THREE.Group();
      g.position.set(p[0], TERRACE.y, p[1]);
      g.rotation.y = p[2];
      const body = mesh(new THREE.ConeGeometry(0.42, 1.28, 9), robe, 0, 0.66, 0, g, true, false);
      body.name = 'monk-robe';
      mesh(new THREE.ConeGeometry(0.3, 0.55, 8), robeDark, 0, 1.2, 0.05, g, false, false);
      const head = mesh(new THREE.SphereGeometry(0.17, 10, 8), skin, 0, 1.52, 0, g, true, false);
      head.name = 'monk-head';
      const bowl = mesh(new THREE.SphereGeometry(0.18, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), MAT.stoneDark, 0.34, 0.95, 0.18, g, false, false);
      bowl.rotation.x = Math.PI;
      groups.gardens.add(g);
    });
  }

  function buildGardens() {
    const treePositions = [
      [-44, 34], [-44, 24], [-44, -30], [-30, 36], [-12, 36], [6, 36], [24, 36],
      [-44, -36], [-28, -36], [-8, -36], [16, -36], [30, -32], [30, 32],
      [12, 26], [-20, 26], [20, 22], [-26, -22]
    ];
    const trunks = [];
    const leavesA = [];
    const leavesB = [];
    treePositions.forEach((p, i) => {
      const h = 4.4 + (i % 3) * 1.1;
      trunks.push([p[0], TERRACE.y + h / 2, p[1], 0, 0, 0, 0.28, h, 0.28]);
      const crownY = TERRACE.y + h + 0.8;
      const r = 1.55 + (i % 4) * 0.28;
      leavesA.push([p[0], crownY, p[1], 0, i, 0, r, r * 0.85, r]);
      leavesB.push([p[0] + 0.9, crownY + 0.9, p[1] - 0.6, 0, i * 2, 0, r * 0.7, r * 0.6, r * 0.7]);
      leavesB.push([p[0] - 0.8, crownY + 0.7, p[1] + 0.7, 0, i * 3, 0, r * 0.62, r * 0.55, r * 0.62]);
      leavesB.push([p[0] + 0.2, crownY - 0.7, p[1] + 1.0, 0, i * 5, 0, r * 0.55, r * 0.5, r * 0.55]);
      addCircle(p[0], p[1], 0.9);
    });
    instanced(new THREE.CylinderGeometry(1, 1, 1, 7), MAT.teak, trunks, groups.gardens, true, true);
    instanced(new THREE.SphereGeometry(1, 9, 7), MAT.foliage, leavesA, groups.gardens, true, true);
    instanced(new THREE.SphereGeometry(1, 8, 6), MAT.foliageLight, leavesB, groups.gardens, true, true);
    const blossoms = [];
    treePositions.forEach((p, i) => {
      if (i % 2) return;
      for (let b = 0; b < 4; b++) {
        const a = (b / 4) * Math.PI * 2 + i;
        blossoms.push([p[0] + Math.cos(a) * 1.2, TERRACE.y + 5.4 + (i % 3) * 1.1 + (b % 2) * 0.5, p[1] + Math.sin(a) * 1.2, 0, 0, 0, 0.34, 0.26, 0.34]);
      }
    });
    instanced(new THREE.SphereGeometry(1, 6, 5), new THREE.MeshStandardMaterial({ color: 0xf3d9d2, roughness: 0.85 }), blossoms, groups.gardens, false, false);

    // hedges along the perimeter walls
    const hedges = [];
    for (let x = -42; x <= 32; x += 3.2) {
      hedges.push([x, TERRACE.y + 0.5, 39.4, 0, 0, 0, 1.5, 0.9, 1.3]);
      hedges.push([x, TERRACE.y + 0.5, -39.4, 0, 0, 0, 1.5, 0.9, 1.3]);
    }
    instanced(new THREE.BoxGeometry(1, 1, 1), MAT.foliage, hedges, groups.gardens, true, true);
  }

  /* ------------------------------------------------------------------ */
  /* 17. Hotspot markers                                                */
  /* ------------------------------------------------------------------ */
  function makeMarkerTexture(icon, accent) {
    const s = 128;
    const c = makeCanvas(s, s);
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, s, s);
    const g = ctx.createRadialGradient(s / 2, s / 2, 4, s / 2, s / 2, s / 2);
    g.addColorStop(0, accent);
    g.addColorStop(0.52, accent);
    g.addColorStop(0.60, 'rgba(8,12,20,.9)');
    g.addColorStop(0.82, 'rgba(8,12,20,.55)');
    g.addColorStop(1, 'rgba(8,12,20,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, 44, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(232,189,99,.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, 53, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#0b1220';
    ctx.font = '600 34px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, s / 2, s / 2 + 2);

    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = MAX_ANISO;
    return tex;
  }

  function buildHotspotMarkers() {
    HOTSPOTS.forEach((h, i) => {
      const g = new THREE.Group();
      g.position.set(h.pos[0], h.pos[1], h.pos[2]);
      g.name = 'marker-' + h.id;
      groups.markers.add(g);

      const spriteMat = new THREE.SpriteMaterial({
        map: makeMarkerTexture(h.num, h.accent), transparent: true, depthWrite: false,
        depthTest: true, sizeAttenuation: true
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(2.9, 2.9, 1);
      sprite.userData.hotspot = h.id;
      sprite.name = 'hotspot-sprite-' + h.id;
      g.add(sprite);

      const beamMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(h.accent), transparent: true, opacity: 0.16,
        depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
      });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.7, 12.5, 10, 1, true), beamMat);
      beam.position.y = 6.3;
      g.add(beam);

      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(h.accent), transparent: true, opacity: 0.5,
        depthWrite: false, side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.3, 40), ringMat);
      ring.position.y = 0.06;
      ring.rotation.x = -Math.PI / 2;
      g.add(ring);

      h.marker = g;
      h.sprite = sprite;
      h.beam = beam;
      h.ring = ring;
      h.index = i;
      h.visited = false;
      h.phase = i * 1.3;
      animated.markerMeshes.push(g);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 18. Build the world                                                */
  /* ------------------------------------------------------------------ */
  function setLoader(pct, msgKey) {
    const fill = $('#loader-fill');
    if (fill) fill.style.width = clamp(pct, 2, 100) + '%';
    const status = $('#loader-status');
    if (status && msgKey) status.textContent = t(msgKey);
  }

  function buildWorld() {
    buildGround();
    buildCentralPrang();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      buildSatellitePrang(Math.cos(a) * 20.4, Math.sin(a) * 20.4, i);
    }
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      buildMondop(Math.cos(a) * 33.0, Math.sin(a) * 33.0, i);
    }
    buildUbosot();
    buildPromenade();
    buildWater();
    buildBoats();
    buildGardens();
    buildMonks();
    buildGate();
    buildContactShadows();
    buildHotspotMarkers();
  }
  /* ------------------------------------------------------------------ */
  /* 19. Time-of-day lighting presets                                   */
  /* ------------------------------------------------------------------ */
  const PRESETS = {
    dawn: {
      label: 'Golden Dawn',
      sunColor: new THREE.Color(0xffc48a),
      sunIntensity: 2.05,
      sunDir: new THREE.Vector3(0.86, 0.20, 0.34).normalize(),
      skyTop: new THREE.Color(0x4f7fae),
      skyMid: new THREE.Color(0xf3c795),
      skyBottom: new THREE.Color(0xffd9a8),
      sunGlow: 1.05,
      stars: 0,
      fog: new THREE.Color(0xe7d3b8),
      fogDensity: 0.0030,
      hemiSky: new THREE.Color(0xbcd6f0),
      hemiGround: new THREE.Color(0x6b5a48),
      hemiIntensity: 0.55,
      ambientColor: new THREE.Color(0xffe6c4),
      ambientIntensity: 0.12,
      exposure: 0.95,
      flood: 0,
      moon: 0,
      water: new THREE.Color(0x123a4d),
      sunSprite: 1.0
    },
    sunset: {
      label: 'Sunset Glow',
      sunColor: new THREE.Color(0xff7a3d),
      sunIntensity: 2.35,
      sunDir: new THREE.Vector3(0.90, 0.075, -0.52).normalize(),
      skyTop: new THREE.Color(0x2c3f66),
      skyMid: new THREE.Color(0xff9a5a),
      skyBottom: new THREE.Color(0xffb877),
      sunGlow: 1.35,
      stars: 0.12,
      fog: new THREE.Color(0xe0915f),
      fogDensity: 0.0036,
      hemiSky: new THREE.Color(0xffb27a),
      hemiGround: new THREE.Color(0x5a3a34),
      hemiIntensity: 0.5,
      ambientColor: new THREE.Color(0xffd0a0),
      ambientIntensity: 0.11,
      exposure: 0.98,
      flood: 0.18,
      moon: 0,
      water: new THREE.Color(0x2a2f3d),
      sunSprite: 1.25
    },
    night: {
      label: 'Night Illumination',
      sunColor: new THREE.Color(0x93a9d6),
      sunIntensity: 0.28,
      sunDir: new THREE.Vector3(-0.38, 0.66, 0.50).normalize(),
      skyTop: new THREE.Color(0x03060f),
      skyMid: new THREE.Color(0x0d1930),
      skyBottom: new THREE.Color(0x1b2b45),
      sunGlow: 0.22,
      stars: 1.0,
      fog: new THREE.Color(0x0a1220),
      fogDensity: 0.0031,
      hemiSky: new THREE.Color(0x2d3f5e),
      hemiGround: new THREE.Color(0x0e0b09),
      hemiIntensity: 0.34,
      ambientColor: new THREE.Color(0x8fa3c4),
      ambientIntensity: 0.10,
      exposure: 1.1,
      flood: 1,
      moon: 0.55,
      water: new THREE.Color(0x081826),
      sunSprite: 0.55
    }
  };

  const LIGHT_NOW = {
    sunColor: new THREE.Color(0xffc48a),
    sunIntensity: 2.05,
    sunDir: new THREE.Vector3(0.86, 0.20, 0.34).normalize(),
    skyTop: new THREE.Color(0x4f7fae),
    skyMid: new THREE.Color(0xf3c795),
    skyBottom: new THREE.Color(0xffd9a8),
    sunGlow: 1.05,
    stars: 0,
    fog: new THREE.Color(0xe7d3b8),
    fogDensity: 0.003,
    hemiSky: new THREE.Color(0xbcd6f0),
    hemiGround: new THREE.Color(0x6b5a48),
    hemiIntensity: 0.85,
    ambientColor: new THREE.Color(0xffe6c4),
    ambientIntensity: 0.17,
    exposure: 1.06,
    flood: 0,
    moon: 0,
    water: new THREE.Color(0x123a4d),
    sunSprite: 1
  };

  let lightTarget = PRESETS.dawn;
  let envTimer = 0;

  function copyPreset(p) {
    LIGHT_NOW.sunColor.copy(p.sunColor);
    LIGHT_NOW.sunIntensity = p.sunIntensity;
    LIGHT_NOW.sunDir.copy(p.sunDir);
    LIGHT_NOW.skyTop.copy(p.skyTop);
    LIGHT_NOW.skyMid.copy(p.skyMid);
    LIGHT_NOW.skyBottom.copy(p.skyBottom);
    LIGHT_NOW.sunGlow = p.sunGlow;
    LIGHT_NOW.stars = p.stars;
    LIGHT_NOW.fog.copy(p.fog);
    LIGHT_NOW.fogDensity = p.fogDensity;
    LIGHT_NOW.hemiSky.copy(p.hemiSky);
    LIGHT_NOW.hemiGround.copy(p.hemiGround);
    LIGHT_NOW.hemiIntensity = p.hemiIntensity;
    LIGHT_NOW.ambientColor.copy(p.ambientColor);
    LIGHT_NOW.ambientIntensity = p.ambientIntensity;
    LIGHT_NOW.exposure = p.exposure;
    LIGHT_NOW.flood = p.flood;
    LIGHT_NOW.moon = p.moon;
    LIGHT_NOW.water.copy(p.water);
    LIGHT_NOW.sunSprite = p.sunSprite;
  }

  function pushLightingToScene() {
    sunLight.color.copy(LIGHT_NOW.sunColor);
    sunLight.intensity = LIGHT_NOW.sunIntensity;
    const d = LIGHT_NOW.sunDir;
    sunLight.position.set(d.x * 150, Math.max(8, d.y * 150), d.z * 150);
    sunLight.target.position.set(0, 6, 0);

    skyUniforms.topColor.value.copy(LIGHT_NOW.skyTop);
    skyUniforms.midColor.value.copy(LIGHT_NOW.skyMid);
    skyUniforms.bottomColor.value.copy(LIGHT_NOW.skyBottom);
    skyUniforms.sunColor.value.copy(LIGHT_NOW.sunColor);
    skyUniforms.sunDir.value.copy(d);
    skyUniforms.sunGlow.value = LIGHT_NOW.sunGlow;
    skyUniforms.stars.value = LIGHT_NOW.stars;

    scene.fog.color.copy(LIGHT_NOW.fog);
    scene.fog.density = LIGHT_NOW.fogDensity;

    hemi.color.copy(LIGHT_NOW.hemiSky);
    hemi.groundColor.copy(LIGHT_NOW.hemiGround);
    hemi.intensity = LIGHT_NOW.hemiIntensity;
    ambient.color.copy(LIGHT_NOW.ambientColor);
    ambient.intensity = LIGHT_NOW.ambientIntensity;
    renderer.toneMappingExposure = LIGHT_NOW.exposure;

    MAT.water.color.copy(LIGHT_NOW.water);
    MAT.water.envMapIntensity = 0.75 + LIGHT_NOW.flood * 0.9;

    lightRig.floodlights.forEach((f) => {
      f.light.intensity = f.base * LIGHT_NOW.flood;
    });
    lightRig.promLights.forEach((l) => {
      l.intensity = 0.55 * LIGHT_NOW.flood;
    });
    lightRig.moon.intensity = LIGHT_NOW.moon * 0.9;

    MAT.lampGlass.emissiveIntensity = 0.25 + LIGHT_NOW.flood * 1.25;
    MAT.gold.emissiveIntensity = 0.25 + LIGHT_NOW.flood * 0.9;

    sunSprite.position.copy(d).multiplyScalar(600);
    const ss = LIGHT_NOW.sunSprite;
    sunSprite.scale.set(110 * ss, 110 * ss, 1);
    sunSprite.material.opacity = clamp(ss, 0, 1.2);
    sunSprite.material.color.copy(LIGHT_NOW.sunColor);

    starMat.opacity = LIGHT_NOW.stars * 0.95;
    animated.stars.visible = LIGHT_NOW.stars > 0.01;

    const cloudColor = LIGHT_NOW.sunColor.clone().lerp(LIGHT_NOW.skyMid, 0.55);
    clouds.forEach((c, i) => {
      c.material.color.copy(cloudColor);
      c.material.opacity = (0.22 - LIGHT_NOW.stars * 0.12) * (i % 3 === 0 ? 0.8 : 1);
    });
    cloudGroup.visible = true;

    if (animated.glow) {
      animated.glow.material.color.copy(LIGHT_NOW.sunColor);
      animated.glow.material.opacity = 0.05 + LIGHT_NOW.flood * 0.34 + LIGHT_NOW.sunGlow * 0.02;
    }
  }

  function applyPreset(name, instant) {
    if (!PRESETS[name]) name = 'dawn';
    State.preset = name;
    lightTarget = PRESETS[name];
    if (instant) {
      copyPreset(lightTarget);
      pushLightingToScene();
    }
    // HUD state
    $$('#preset-switch .seg-btn').forEach((b) => {
      const on = b.dataset.preset === name;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    const stat = $('#stat-preset');
    if (stat) stat.textContent = t('preset.' + name);
    document.documentElement.dataset.preset = name;
    if (!instant) {
      clearTimeout(envTimer);
      envTimer = setTimeout(updateEnvironment, 1100);
      saveLocalSoon();
    }
  }

  function updateLighting(dt) {
    const k = 1 - Math.exp(-3.4 * dt);
    LIGHT_NOW.sunColor.lerp(lightTarget.sunColor, k);
    LIGHT_NOW.sunIntensity = lerp(LIGHT_NOW.sunIntensity, lightTarget.sunIntensity, k);
    LIGHT_NOW.sunDir.lerp(lightTarget.sunDir, k).normalize();
    LIGHT_NOW.skyTop.lerp(lightTarget.skyTop, k);
    LIGHT_NOW.skyMid.lerp(lightTarget.skyMid, k);
    LIGHT_NOW.skyBottom.lerp(lightTarget.skyBottom, k);
    LIGHT_NOW.sunGlow = lerp(LIGHT_NOW.sunGlow, lightTarget.sunGlow, k);
    LIGHT_NOW.stars = lerp(LIGHT_NOW.stars, lightTarget.stars, k);
    LIGHT_NOW.fog.lerp(lightTarget.fog, k);
    LIGHT_NOW.fogDensity = lerp(LIGHT_NOW.fogDensity, lightTarget.fogDensity, k);
    LIGHT_NOW.hemiSky.lerp(lightTarget.hemiSky, k);
    LIGHT_NOW.hemiGround.lerp(lightTarget.hemiGround, k);
    LIGHT_NOW.hemiIntensity = lerp(LIGHT_NOW.hemiIntensity, lightTarget.hemiIntensity, k);
    LIGHT_NOW.ambientColor.lerp(lightTarget.ambientColor, k);
    LIGHT_NOW.ambientIntensity = lerp(LIGHT_NOW.ambientIntensity, lightTarget.ambientIntensity, k);
    LIGHT_NOW.exposure = lerp(LIGHT_NOW.exposure, lightTarget.exposure, k);
    LIGHT_NOW.flood = lerp(LIGHT_NOW.flood, lightTarget.flood, k);
    LIGHT_NOW.moon = lerp(LIGHT_NOW.moon, lightTarget.moon, k);
    LIGHT_NOW.water.lerp(lightTarget.water, k);
    LIGHT_NOW.sunSprite = lerp(LIGHT_NOW.sunSprite, lightTarget.sunSprite, k);
    pushLightingToScene();
  }

  /* ------------------------------------------------------------------ */
  /* 20. Web Audio synthesis                                            */
  /* ------------------------------------------------------------------ */
  const AudioEngine = {
    ctx: null,
    master: null,
    ambGain: null,
    ambLayer: null,
    ready: false,
    muted: false,
    nextChime: 2.5,
    speechVoices: [],

    init() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try {
        this.ctx = new AC();
      } catch (e) {
        State.errors.push('audio: ' + e.message);
        return false;
      }
      const ctx = this.ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(ctx.destination);

      this.ambGain = ctx.createGain();
      this.ambGain.gain.value = 0.55;
      this.ambGain.connect(this.master);

      // looping river bed -------------------------------------------------
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.0;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 760;
      lp.Q.value = 0.55;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1500;
      bp.Q.value = 0.7;

      const lapGain = ctx.createGain();
      lapGain.gain.value = 0.42;
      const shimmerGain = ctx.createGain();
      shimmerGain.gain.value = 0.055;

      // slow LFO gives the water a breathing rhythm
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.09;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.3;
      lfo.connect(lfoGain);
      lfoGain.connect(lapGain.gain);
      lfo.start();

      src.connect(lp);
      lp.connect(lapGain);
      lapGain.connect(this.ambGain);
      src.connect(bp);
      bp.connect(shimmerGain);
      shimmerGain.connect(this.ambGain);
      src.start();
      this.ambLayer = { src, lp, bp, lapGain, shimmerGain, lfo };

      // footstep noise buffer
      const fs = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.22), ctx.sampleRate);
      const fd = fs.getChannelData(0);
      for (let i = 0; i < fd.length; i++) fd[i] = (Math.random() * 2 - 1) * (1 - i / fd.length);
      this.stepBuffer = fs;

      this.ready = true;
      if (this.muted) this.master.gain.value = 0;
      this.refreshVoices();
      return true;
    },

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    },

    setMuted(muted) {
      this.muted = muted;
      if (this.master) {
        const now = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.85, now + 0.25);
      }
    },

    chime() {
      if (!this.ready || this.muted) return;
      const ctx = this.ctx;
      const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const n = 2 + ((Math.random() * 3) | 0);
      const t0 = ctx.currentTime + 0.05;
      for (let i = 0; i < n; i++) {
        const f = scale[(Math.random() * scale.length) | 0] * (Math.random() > 0.7 ? 0.5 : 1);
        const start = t0 + i * (0.14 + Math.random() * 0.2);
        const dur = 2.4 + Math.random() * 1.8;
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (pan) pan.pan.value = (Math.random() * 2 - 1) * 0.85;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.055 + Math.random() * 0.02, start + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        const o1 = ctx.createOscillator();
        o1.type = 'sine';
        o1.frequency.value = f;
        const o2 = ctx.createOscillator();
        o2.type = 'sine';
        o2.frequency.value = f * 2.76;
        const g2 = ctx.createGain();
        g2.gain.value = 0.22;
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.value = 4200;
        o1.connect(g);
        o2.connect(g2);
        g2.connect(g);
        g.connect(filt);
        if (pan) { filt.connect(pan); pan.connect(this.ambGain); }
        else filt.connect(this.ambGain);
        o1.start(start); o1.stop(start + dur + 0.1);
        o2.start(start); o2.stop(start + dur + 0.1);
      }
    },

    footstep(strong) {
      if (!this.ready || this.muted || !this.stepBuffer) return;
      const ctx = this.ctx;
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = this.stepBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 380 + Math.random() * 420;
      bp.Q.value = 0.9;
      const g = ctx.createGain();
      const vol = (strong ? 0.14 : 0.075) * (0.75 + Math.random() * 0.5);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
      src.connect(bp); bp.connect(g); g.connect(this.master);
      src.start(t); src.stop(t + 0.24);

      if (strong) {
        const o = ctx.createOscillator();
        const og = ctx.createGain();
        o.frequency.setValueAtTime(120, t);
        o.frequency.exponentialRampToValueAtTime(60, t + 0.12);
        og.gain.setValueAtTime(0.04, t);
        og.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        o.connect(og); og.connect(this.master);
        o.start(t); o.stop(t + 0.16);
      }
    },

    tick(dt) {
      if (!this.ready || this.muted) return;
      this.nextChime -= dt;
      if (this.nextChime <= 0) {
        this.chime();
        this.nextChime = 7 + Math.random() * 12;
      }
    },

    refreshVoices() {
      if (!('speechSynthesis' in window)) return;
      try {
        this.speechVoices = window.speechSynthesis.getVoices() || [];
      } catch (e) { this.speechVoices = []; }
    },

    stopSpeech() {
      if (!('speechSynthesis' in window)) return;
      try { window.speechSynthesis.cancel(); } catch (e) { /* noop */ }
    },

    speak(text, lang, cbs) {
      if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return false;
      const synth = window.speechSynthesis;
      try { synth.cancel(); } catch (e) { /* noop */ }
      const u = new SpeechSynthesisUtterance(text);
      const want = lang === 'th' ? 'th' : 'en';
      u.lang = lang === 'th' ? 'th-TH' : 'en-US';
      u.rate = lang === 'th' ? 0.95 : 0.96;
      u.pitch = 1.0;
      u.volume = 1.0;
      if (!this.speechVoices.length) this.refreshVoices();
      const pick = this.speechVoices.find((v) => (v.lang || '').toLowerCase().indexOf(want) === 0)
        || this.speechVoices.find((v) => (v.lang || '').toLowerCase().indexOf(want) > -1);
      if (pick) u.voice = pick;
      const hasVoice = !!pick;
      u.onstart = () => cbs && cbs.onStart && cbs.onStart(hasVoice);
      u.onend = () => cbs && cbs.onEnd && cbs.onEnd();
      u.onerror = () => cbs && cbs.onError && cbs.onError();
      try { synth.speak(u); } catch (e) { return false; }
      // Safari sometimes queues silently; resume if paused
      setTimeout(() => { try { if (synth.paused) synth.resume(); } catch (e) {} }, 150);
      return true;
    }
  };

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.onvoiceschanged = () => AudioEngine.refreshVoices();
      AudioEngine.refreshVoices();
    } catch (e) { /* noop */ }
  }

  /* ------------------------------------------------------------------ */
  /* 21. Mini-map                                                       */
  /* ------------------------------------------------------------------ */
  const minimap = $('#minimap');
  const mmCtx = minimap ? minimap.getContext('2d') : null;
  const MM = { size: 240, scale: 1.62, cx: 120, cy: 120 };
  const mmTransform = (x, z) => [MM.cx + x * MM.scale, MM.cy + z * MM.scale];

  function drawMinimap() {
    if (!mmCtx) return;
    const ctx = mmCtx;
    const W = MM.size;
    ctx.clearRect(0, 0, W, W);
    ctx.save();

    // backdrop
    const bg = ctx.createRadialGradient(120, 120, 10, 120, 120, 170);
    bg.addColorStop(0, '#12202c');
    bg.addColorStop(1, '#070c14');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, W);

    // river
    const [rx] = mmTransform(RIVER_X, 0);
    const wg = ctx.createLinearGradient(rx, 0, W, 0);
    wg.addColorStop(0, '#1c4a63');
    wg.addColorStop(1, '#0d2838');
    ctx.fillStyle = wg;
    ctx.fillRect(rx, 0, W - rx, W);
    // river ripples
    ctx.strokeStyle = 'rgba(150,210,240,.10)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const y = 18 + i * 32;
      ctx.beginPath();
      ctx.moveTo(rx + 6, y);
      ctx.bezierCurveTo(rx + 24, y - 3, W - 20, y + 4, W - 2, y - 1);
      ctx.stroke();
    }

    // terrace
    const [tx1, tz1] = mmTransform(TERRACE.minX, TERRACE.minZ);
    const [tx2, tz2] = mmTransform(TERRACE.maxX, TERRACE.maxZ);
    ctx.fillStyle = '#1b2430';
    ctx.fillRect(tx1, tz1, tx2 - tx1, tz2 - tz1);
    ctx.strokeStyle = 'rgba(232,189,99,.18)';
    ctx.lineWidth = 1;
    ctx.strokeRect(tx1 + 1.5, tz1 + 1.5, tx2 - tx1 - 3, tz2 - tz1 - 3);

    // boardwalk
    const [bx1] = mmTransform(BOARDWALK.minX, 0);
    const [bx2] = mmTransform(BOARDWALK.maxX, 0);
    ctx.fillStyle = '#2c3440';
    ctx.fillRect(bx1, tz1, bx2 - bx1, tz2 - tz1);
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.strokeRect(bx1 + 1, tz1, bx2 - bx1 - 2, tz2 - tz1);

    // salas
    ctx.fillStyle = '#2f6a57';
    [-36, -24, -12, 12, 24, 36].forEach((z) => {
      const [sx, sz] = mmTransform(47.4, z);
      ctx.fillRect(sx - 3.4, sz - 3.4, 6.8, 6.8);
    });

    // ubosot
    const [ux, uz] = mmTransform(-34, 0);
    const uw = 26 * MM.scale, ud = 15 * MM.scale;
    ctx.fillStyle = '#7a4034';
    ctx.fillRect(ux - uw / 2, uz - ud / 2, uw, ud);
    ctx.strokeStyle = 'rgba(232,189,99,.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(ux - uw / 2, uz - ud / 2, uw, ud);
    ctx.fillStyle = '#d9a94f';
    ctx.fillRect(ux - 1, uz - ud / 2 - 2, 2, 4);
    ctx.fillRect(ux - 1, uz + ud / 2 - 2, 2, 4);

    // prang
    const [px, pz] = mmTransform(0, 0);
    const pr = 13.8 * MM.scale;
    ctx.save();
    ctx.translate(px, pz);
    ctx.fillStyle = '#e8bd63';
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(0, -pr);
    ctx.lineTo(pr, 0);
    ctx.lineTo(0, pr);
    ctx.lineTo(-pr, 0);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#fff0c9';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // satellites
    ctx.fillStyle = '#c9a95f';
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const [sx, sz] = mmTransform(Math.cos(a) * 19.5, Math.sin(a) * 19.5);
      ctx.save();
      ctx.translate(sx, sz);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();
    }
    // mondops
    ctx.fillStyle = '#8f7a55';
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const [sx, sz] = mmTransform(Math.cos(a) * 33.0, Math.sin(a) * 33.0);
      ctx.fillRect(sx - 3, sz - 3, 6, 6);
    }

    // hotspots
    HOTSPOTS.forEach((h) => {
      const [hx, hz] = mmTransform(h.pos[0], h.pos[2]);
      const vis = h.visited;
      ctx.beginPath();
      ctx.arc(hx, hz, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = vis ? '#57c39b' : 'rgba(232,189,99,.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(8,12,20,.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // player + view cone
    const [ppx, ppz] = mmTransform(player.x, player.z);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const ang = Math.atan2(dir.z, dir.x);
    ctx.save();
    ctx.translate(ppx, ppz);
    ctx.rotate(ang);
    const cone = ctx.createLinearGradient(0, 0, 34, 0);
    cone.addColorStop(0, 'rgba(255,236,190,.34)');
    cone.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 34, -0.46, 0.46);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f4e6c4';
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(-4, 4.6);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-4, -4.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
  /* ------------------------------------------------------------------ */
  /* 22. DOM references and small UI helpers                            */
  /* ------------------------------------------------------------------ */
  const ui = {
    loader: $('#loader'),
    intro: $('#intro'),
    modal: $('#modal'),
    help: $('#help'),
    gallery: $('#gallery'),
    toast: $('#toast'),
    hotspotList: $('#hotspot-list'),
    visitedCount: $('#visited-count'),
    zoneName: $('#zone-name'),
    zoneHint: $('#zone-hint'),
    coords: $('#coords'),
    statMode: $('#stat-mode'),
    statPreset: $('#stat-preset'),
    crosshair: $('#crosshair'),
    reticleHint: $('#reticle-hint'),
    nearby: $('#nearby'),
    nearbyLabel: $('#nearby-label'),
    modalTitle: $('#modal-title'),
    modalThai: $('#modal-thai-title'),
    modalEyebrow: $('#modal-eyebrow'),
    modalBody: $('#modal-body'),
    modalQuote: $('#modal-quote'),
    modalIndex: $('#modal-index'),
    modalIcon: $('#modal-icon'),
    modalVisited: $('#modal-visited-tag'),
    modalStatus: $('#modal-status'),
    galleryGrid: $('#gallery-grid'),
    galleryEmpty: $('#gallery-empty')
  };

  let introVisible = true;
  let toastTimer = 0;
  let saveTimer = 0;
  let hoverHotspot = null;
  let nearbyHotspot = null;
  let lastZone = '';
  let frame = 0;
  let selftestDone = false;
  const suppressed = Object.create(null);
  let suppressTimer = 0;
  const inModal = { open: false, id: null };

  function toast(msg, ms) {
    if (!ui.toast) return;
    ui.toast.textContent = msg;
    ui.toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove('is-on'), ms || 2600);
  }

  function setStatus(msg, ok) {
    if (!ui.modalStatus) return;
    ui.modalStatus.textContent = msg || '';
    ui.modalStatus.classList.toggle('is-ok', !!ok);
  }

  /* ------------------------------------------------------------------ */
  /* 23. Language switching                                             */
  /* ------------------------------------------------------------------ */
  function buildHotspotList() {
    if (!ui.hotspotList) return;
    ui.hotspotList.innerHTML = '';
    HOTSPOTS.forEach((h, i) => {
      const li = document.createElement('li');
      li.className = 'hotspot-item' + (h.visited ? ' is-visited' : '');
      li.dataset.id = h.id;
      li.setAttribute('role', 'button');
      li.tabIndex = 0;
      li.innerHTML =
        '<span class="hs-num">' + h.num + '</span>' +
        '<span class="hs-text"><b></b><span></span></span>';
      li.querySelector('b').textContent = h[LANG].title;
      li.querySelector('.hs-text span').textContent = h[LANG].eyebrow;
      li.addEventListener('click', () => openHotspot(h.id));
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openHotspot(h.id); }
      });
      ui.hotspotList.appendChild(li);
    });
    updateVisitedBadge();
  }

  function updateVisitedBadge() {
    const label = State.visited.length + ' / ' + HOTSPOTS.length;
    if (ui.visitedCount) ui.visitedCount.textContent = label;
    const mob = $('#mobile-visited');
    if (mob) mob.textContent = label;
  }

  function updateZoneLabel(force) {
    const zid = zoneAt(player.x, player.z);
    if (!force && zid === lastZone) return;
    lastZone = zid;
    if (ui.zoneName) ui.zoneName.textContent = t('zone.' + zid);
    if (ui.zoneHint) ui.zoneHint.textContent = t('zone.' + zid + 'Hint');
  }

  function setLanguage(lang, silent) {
    LANG = lang === 'th' ? 'th' : 'en';
    State.lang = LANG;
    document.documentElement.lang = LANG;
    document.documentElement.setAttribute('data-lang', LANG);
    $$('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    $$('#lang-switch .seg-btn').forEach((b) => {
      const on = b.dataset.lang === LANG;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    const stat = $('#stat-preset');
    if (stat) stat.textContent = t('preset.' + State.preset);
    if (ui.statMode) ui.statMode.textContent = t(State.mode === 'walk' ? 'mode.walkValue' : 'mode.orbitValue');
    buildHotspotList();
    updateZoneLabel(true);
    if (inModal.open) renderModal();
    if (ui.gallery && !ui.gallery.hidden) renderGallery();
    if (!silent) {
      saveLocalSoon();
      toast(LANG === 'th' ? 'ภาษาไทย' : 'English', 1600);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 24. Hotspot modal                                                  */
  /* ------------------------------------------------------------------ */
  function renderModal() {
    const hs = HOTSPOT_BY_ID[inModal.id];
    if (!hs) return;
    const copy = hs[LANG] || hs.en;
    ui.modalEyebrow.textContent = copy.eyebrow;
    ui.modalTitle.textContent = copy.title;
    ui.modalThai.textContent = LANG === 'th' ? hs.en.title : hs.th.title;
    ui.modalIndex.textContent = t('modal.index') + ' ' + hs.num + ' / 0' + HOTSPOTS.length;
    ui.modalIcon.textContent = hs.num;
    ui.modalBody.innerHTML = '';
    copy.body.forEach((p) => {
      const el = document.createElement('p');
      el.textContent = p;
      ui.modalBody.appendChild(el);
    });
    ui.modalQuote.textContent = '“' + copy.quote + '”';
    ui.modalVisited.classList.toggle('is-off', !hs.visited);
    if (ui.modalStatus && !ui.modalStatus.textContent) setStatus('');
  }

  function openHotspot(id) {
    const hs = HOTSPOT_BY_ID[id];
    if (!hs) return;
    inModal.open = true;
    inModal.id = id;
    const lp = $('#panel-left');
    if (lp) lp.classList.remove('is-open');
    const ht = $('#btn-hotspots');
    if (ht) ht.setAttribute('aria-expanded', 'false');
    State.lastHotspot = id;
    markVisited(id);
    setStatus('');
    renderModal();
    ui.modal.hidden = false;
    AudioEngine.stopSpeech();
    if (pointer && pointer.isLocked) {
      try { pointer.unlock(); } catch (e) { /* noop */ }
    }
    suppressed[id] = true;
  }

  function closeModal() {
    if (!inModal.open) return;
    const id = inModal.id;
    inModal.open = false;
    ui.modal.hidden = true;
    AudioEngine.stopSpeech();
    setStatus('');
    if (id) suppressed[id] = true;
    saveLocalSoon();
  }

  function markVisited(id) {
    const hs = HOTSPOT_BY_ID[id];
    if (!hs) return;
    if (!hs.visited) {
      hs.visited = true;
      if (State.visited.indexOf(id) === -1) State.visited.push(id);
      updateVisitedBadge();
      buildHotspotList();
      saveLocalSoon();
    }
  }

  function nextHotspot() {
    const idx = HOTSPOT_BY_ID[inModal.id] ? HOTSPOT_BY_ID[inModal.id].index : -1;
    const next = HOTSPOTS[(idx + 1) % HOTSPOTS.length];
    openHotspot(next.id);
    if (State.mode === 'walk') {
      // gently turn the player toward the next marker
      const target = new THREE.Vector3(next.pos[0], 1.6, next.pos[2]);
      const dir = target.clone().sub(camera.position);
      player.yaw = Math.atan2(-dir.x, -dir.z);
      camera.rotation.y = player.yaw;
    }
  }

  function nearbyTarget() {
    let best = null;
    let bestD = 1e9;
    for (const h of HOTSPOTS) {
      const dx = player.x - h.pos[0];
      const dz = player.z - h.pos[2];
      const d = Math.hypot(dx, dz);
      if (d < bestD) { bestD = d; best = h; }
      if (d > h.radius + 5) suppressed[h.id] = false;
    }
    return { hs: best, dist: bestD };
  }

  function updateNearby() {
    if (inModal.open || State.mode !== 'walk' || introVisible) {
      if (ui.nearby) ui.nearby.hidden = true;
      nearbyHotspot = null;
      return;
    }
    const near = nearbyTarget();
    nearbyHotspot = near.hs && near.dist < 16 ? near.hs : null;
    if (ui.nearby) {
      const show = !!nearbyHotspot && near.dist < 7.5;
      ui.nearby.hidden = !show;
      if (show) {
        ui.nearbyLabel.textContent = (LANG === 'th' ? 'ตรวจดู: ' : 'Inspect: ') + nearbyHotspot[LANG].title;
      }
    }
    // auto-open when the visitor steps into the inner ring
    if (near.hs && near.hs.auto && near.dist < near.hs.radius * 0.72 && !suppressed[near.hs.id] && !SHOT) {
      openHotspot(near.hs.id);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 25. Controls (walk + drone)                                        */
  /* ------------------------------------------------------------------ */
  const pointer = new THREE.PointerLockControls(camera, renderer.domElement);
  const orbit = new THREE.OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.07;
  orbit.rotateSpeed = 0.55;
  orbit.zoomSpeed = 0.9;
  orbit.panSpeed = 0.6;
  orbit.minDistance = 16;
  orbit.maxDistance = 270;
  orbit.maxPolarAngle = Math.PI * 0.495;
  orbit.target.set(0, 24, 0);
  orbit.enabled = false;

  const raycaster = new THREE.Raycaster();
  raycaster.params.Sprite = { threshold: 2 };
  const screenCenter = new THREE.Vector2(0, 0);
  let markerSprites = [];

  const drag = { on: false, x: 0, y: 0, moved: 0 };
  const touchLook = { id: -1, x: 0, y: 0 };

  function isTypeable(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  function setMode(mode, silent) {
    if (mode !== 'walk' && mode !== 'orbit') return;
    const changed = State.mode !== mode;
    State.mode = mode;
    document.body.classList.toggle('orbit-mode', mode === 'orbit');

    if (mode === 'walk') {
      orbit.enabled = false;
      placeCameraOnPlayer();
    } else {
      if (pointer.isLocked) { try { pointer.unlock(); } catch (e) {} }
      // start from the current viewpoint, but keep the prang framed
      const offset = camera.position.clone().sub(orbit.target);
      if (offset.length() < orbit.minDistance) {
        camera.position.set(132, 58, 56);
      }
      orbit.target.set(0, 27, 0);
      orbit.enabled = true;
      orbit.update();
    }
    camera.fov = mode === 'walk' ? 60 : 52;
    camera.updateProjectionMatrix();
    $$('#mode-switch .seg-btn').forEach((b) => {
      const on = b.dataset.mode === mode;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (ui.statMode) ui.statMode.textContent = t(mode === 'walk' ? 'mode.walkValue' : 'mode.orbitValue');
    if (ui.nearby) ui.nearby.hidden = true;
    if (!silent) {
      toast(t(mode === 'walk' ? 'toast.modeWalk' : 'toast.modeOrbit'), 2900);
      saveLocalSoon();
    }
    if (changed) updateZoneLabel(true);
  }

  function placeCameraOnPlayer() {
    camera.rotation.order = 'YXZ';
    camera.position.set(player.x, player.y + player.eye, player.z);
    camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
  }

  function requestLock() {
    if (SHOT || IS_TOUCH) return;
    try {
      const p = pointer.lock && pointer.lock();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (e) { /* pointer lock unavailable */ }
  }

  function toggleMap() {
    const panel = $('#panel-right');
    if (!panel) return;
    panel.classList.toggle('is-hidden');
  }

  function resetDrone() {
    if (State.mode !== 'orbit') return;
    camera.position.set(132, 58, 56);
    orbit.target.set(0, 27, 0);
    orbit.update();
    toast(t('toast.reset'), 1500);
  }

  function updateHoverTarget() {
    if (State.mode === 'walk' && !introVisible && !inModal.open && markerSprites.length) {
      raycaster.setFromCamera(screenCenter, camera);
      const hits = raycaster.intersectObjects(markerSprites, false);
      const hit = hits.find((h) => h.distance < 120);
      const id = hit ? hit.object.userData.hotspot : null;
      hoverHotspot = id ? HOTSPOT_BY_ID[id] : null;
      if (hoverHotspot) {
        ui.reticleHint.textContent = (LANG === 'th' ? 'อ่าน: ' : 'Read: ') + hoverHotspot[LANG].title;
        ui.reticleHint.classList.add('is-on');
        ui.crosshair.classList.add('is-hot');
      } else {
        ui.reticleHint.classList.remove('is-on');
        ui.crosshair.classList.remove('is-hot');
      }
    } else {
      hoverHotspot = null;
      ui.reticleHint.classList.remove('is-on');
      ui.crosshair.classList.remove('is-hot');
    }
  }

  function interact() {
    if (inModal.open || introVisible) return;
    if (hoverHotspot) { openHotspot(hoverHotspot.id); return; }
    const near = nearbyTarget();
    if (near.hs && near.dist < 14) openHotspot(near.hs.id);
  }

  /* ------------------------------------------------------------------ */
  /* 26. Player movement and collision                                  */
  /* ------------------------------------------------------------------ */
  function resolveCollisions(x, z) {
    let px = x;
    let pz = z;
    const pr = player.radius;
    for (let it = 0; it < 3; it++) {
      px = clamp(px, -47.1, 52.8);
      pz = clamp(pz, -48.4, 48.4);
      for (let i = 0; i < colliders.circles.length; i++) {
        const c = colliders.circles[i];
        const dx = px - c.x;
        const dz = pz - c.z;
        const rr = c.r + pr;
        const d2 = dx * dx + dz * dz;
        if (d2 < rr * rr) {
          const d = Math.sqrt(d2);
          if (d < 0.001) {
            px = c.x + rr;
            pz = c.z;
          } else {
            px = c.x + (dx / d) * rr;
            pz = c.z + (dz / d) * rr;
          }
        }
      }
      for (let i = 0; i < colliders.boxes.length; i++) {
        const b = colliders.boxes[i];
        if (px > b.minX - pr && px < b.maxX + pr && pz > b.minZ - pr && pz < b.maxZ + pr) {
          const dl = px - (b.minX - pr);
          const dr = (b.maxX + pr) - px;
          const dt = pz - (b.minZ - pr);
          const db = (b.maxZ + pr) - pz;
          const m = Math.min(dl, dr, dt, db);
          if (m === dl) px = b.minX - pr;
          else if (m === dr) px = b.maxX + pr;
          else if (m === dt) pz = b.minZ - pr;
          else pz = b.maxZ + pr;
        }
      }
    }
    return { x: px, z: pz };
  }

  const moveDir = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);

  function updatePlayer(dt) {
    if (State.mode !== 'walk') return;

    const mf = (keys['w'] || keys['arrowup'] ? 1 : 0) - (keys['s'] || keys['arrowdown'] ? 1 : 0) + (touchMove.fwd - touchMove.back);
    const mr = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0) + (touchMove.right - touchMove.left);

    const sprint = !!(keys['shift']);
    const speed = sprint ? 8.2 : 4.35;

    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 0.0001) forward.set(0, 0, -1);
    forward.normalize();
    right.crossVectors(forward, UP).normalize();

    moveDir.set(0, 0, 0);
    if (mf) moveDir.addScaledVector(forward, mf);
    if (mr) moveDir.addScaledVector(right, mr);

    const moving = moveDir.lengthSq() > 0.0001;
    let moved = 0;
    if (moving) {
      moveDir.normalize();
      const step = speed * dt;
      const nx = player.x + moveDir.x * step;
      const nz = player.z + moveDir.z * step;
      const solved = resolveCollisions(nx, nz);
      moved = Math.hypot(solved.x - player.x, solved.z - player.z);
      player.x = solved.x;
      player.z = solved.z;
    }

    // jump / gravity
    const gh = groundHeight(player.x, player.z);
    if (player.onGround) {
      player.y = damp(player.y, gh, 15, dt);
      if (Math.abs(player.y - gh) < 0.002) player.y = gh;
      if (keys[' ']) {
        player.vy = 5.5;
        player.onGround = false;
        keys[' '] = false;
      }
    } else {
      player.vy -= 19 * dt;
      player.y += player.vy * dt;
      if (player.y <= gh) {
        player.y = gh;
        player.vy = 0;
        player.onGround = true;
      }
    }

    // head bob and footsteps
    let bob = 0;
    if (moving && player.onGround) {
      stepState.dist += moved;
      const stride = sprint ? 1.15 : 0.82;
      if (stepState.dist > stride) {
        stepState.dist = 0;
        AudioEngine.footstep(sprint);
      }
      stepState.phase += moved * (sprint ? 2.6 : 2.2);
      bob = Math.sin(stepState.phase) * (sprint ? 0.055 : 0.032);
    }

    player.yaw = camera.rotation.y;
    player.pitch = camera.rotation.x;
    camera.position.set(player.x, player.y + player.eye + bob, player.z);

    if (ui.coords) {
      ui.coords.textContent = 'X ' + player.x.toFixed(1) + ' · Z ' + player.z.toFixed(1);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 27. Photos and journal                                             */
  /* ------------------------------------------------------------------ */
  function currentViewTitle() {
    if (inModal.open && HOTSPOT_BY_ID[inModal.id]) return HOTSPOT_BY_ID[inModal.id][LANG].title;
    const zid = zoneAt(player.x, player.z);
    return t('zone.' + zid) + ' · ' + t('preset.' + State.preset);
  }

  function capturePhoto() {
    try {
      renderer.render(scene, camera);
      const src = renderer.domElement;
      const w = 520;
      const h = Math.round((w * src.height) / src.width);
      const c = makeCanvas(w, h);
      const ctx = c.getContext('2d');
      ctx.drawImage(src, 0, 0, w, h);
      const data = c.toDataURL('image/jpeg', 0.72);
      const photo = {
        id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: currentViewTitle(),
        lang: LANG,
        preset: State.preset,
        ts: new Date().toISOString(),
        data: data
      };
      State.photos.unshift(photo);
      if (State.photos.length > 12) {
        State.photos.pop();
        toast(t('toast.photoLimit'));
      } else {
        toast(t('toast.photoSaved'));
      }
      if (inModal.open) setStatus(t('toast.photoSaved'), true);
      saveLocalSoon();
      if (ui.gallery && !ui.gallery.hidden) renderGallery();
      return photo;
    } catch (e) {
      State.errors.push('photo: ' + e.message);
      toast(t('toast.photoFail'));
      return null;
    }
  }

  function renderGallery() {
    if (!ui.galleryGrid) return;
    ui.galleryGrid.innerHTML = '';
    if (!State.photos.length) {
      if (ui.galleryEmpty) ui.galleryEmpty.style.display = '';
      return;
    }
    if (ui.galleryEmpty) ui.galleryEmpty.style.display = 'none';
    State.photos.forEach((p) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      const img = document.createElement('img');
      img.src = p.data;
      img.alt = p.title;
      img.loading = 'lazy';
      const meta = document.createElement('div');
      meta.className = 'gi-meta';
      const b = document.createElement('b');
      b.textContent = p.title;
      const sp = document.createElement('span');
      sp.textContent = new Date(p.ts).toLocaleDateString();
      meta.appendChild(b); meta.appendChild(sp);
      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = '×';
      del.title = t('gallery.remove');
      del.setAttribute('aria-label', t('gallery.remove'));
      del.addEventListener('click', () => {
        State.photos = State.photos.filter((x) => x.id !== p.id);
        renderGallery();
        saveLocalSoon();
        toast(t('toast.photoDeleted'), 1600);
      });
      item.appendChild(img);
      item.appendChild(meta);
      item.appendChild(del);
      ui.galleryGrid.appendChild(item);
    });
  }

  function journalPayload() {
    return {
      format: 'watarun-3d-journal',
      version: 1,
      app: 'Wat Arun 3D: Virtual Riverside Sanctuary & Walkthrough Studio',
      exportedAt: new Date().toISOString(),
      session: {
        startedAt: new Date(State.startedAt).toISOString(),
        elapsedSeconds: Math.round((Date.now() - State.startedAt) / 1000)
      },
      settings: {
        lang: LANG,
        preset: State.preset,
        audio: !AudioEngine.muted
      },
      visited: State.visited.slice(),
      photos: State.photos.map((p) => ({
        id: p.id, title: p.title, lang: p.lang, preset: p.preset, ts: p.ts, data: p.data
      })),
      player: { x: +player.x.toFixed(2), z: +player.z.toFixed(2) },
      credits: {
        builtWith: 'OpenCode + DeepSeek V4.1 Flash',
        runtime: 'Three.js r128',
        note: 'Educational homage. Not affiliated with Wat Arun Ratchawararam.'
      }
    };
  }

  function saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(journalPayload()));
      return true;
    } catch (e) {
      // quota: drop oldest photos and retry once
      if (State.photos.length > 2) {
        State.photos = State.photos.slice(0, Math.floor(State.photos.length / 2));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(journalPayload()));
          return true;
        } catch (e2) { /* noop */ }
      }
      State.errors.push('storage: ' + e.message);
      return false;
    }
  }

  function saveLocalSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveLocal, 450);
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 400);
  }

  function exportJournal() {
    saveLocal();
    const payload = journalPayload();
    download(JOURNAL_FILE, JSON.stringify(payload, null, 2));
    toast(t('toast.exported'), 3000);
    return payload;
  }

  function applyJournal(data) {
    if (!data || data.format !== 'watarun-3d-journal') return false;
    if (Array.isArray(data.visited)) {
      State.visited = data.visited.filter((id) => !!HOTSPOT_BY_ID[id]);
      HOTSPOTS.forEach((h) => { h.visited = State.visited.indexOf(h.id) !== -1; });
    }
    if (Array.isArray(data.photos)) {
      State.photos = data.photos
        .filter((p) => p && typeof p.data === 'string' && p.data.indexOf('data:image') === 0)
        .slice(0, 12);
    }
    if (data.settings) {
      if (data.settings.lang) setLanguage(data.settings.lang, true);
      if (data.settings.preset && PRESETS[data.settings.preset]) applyPreset(data.settings.preset);
      if (typeof data.settings.audio === 'boolean') {
        State.audio = data.settings.audio;
        AudioEngine.setMuted(!State.audio);
        const btn = $('#btn-audio');
        if (btn) {
          btn.setAttribute('aria-pressed', State.audio ? 'true' : 'false');
          btn.title = State.audio ? t('audio.on') : t('audio.off');
        }
      }
    }
    buildHotspotList();
    updateVisitedBadge();
    if (ui.gallery) renderGallery();
    saveLocal();
    return true;
  }

  function loadJournal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) { input.remove(); return; }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result));
          if (applyJournal(data)) {
            toast(t('toast.loaded'), 3000);
            if (data.player && typeof data.player.x === 'number') {
              const solved = resolveCollisions(data.player.x, data.player.z);
              player.x = solved.x;
              player.z = solved.z;
              player.y = groundHeight(player.x, player.z);
              if (State.mode === 'walk') placeCameraOnPlayer();
            }
          } else {
            toast(t('toast.loadFail'), 3200);
          }
        } catch (e) {
          toast(t('toast.loadFail'), 3200);
        }
        input.remove();
      };
      reader.onerror = () => { toast(t('toast.loadFail')); input.remove(); };
      reader.readAsText(file);
    }, { once: true });
    input.click();
  }

  function restoreLocal() {
    let raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { return; }
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (!data || data.format !== 'watarun-3d-journal') return;
      if (Array.isArray(data.visited)) {
        State.visited = data.visited.filter((id) => !!HOTSPOT_BY_ID[id]);
        HOTSPOTS.forEach((h) => { h.visited = State.visited.indexOf(h.id) !== -1; });
      }
      if (Array.isArray(data.photos)) {
        State.photos = data.photos.filter((p) => p && typeof p.data === 'string').slice(0, 12);
      }
      if (data.settings) {
        if (data.settings.lang && data.settings.lang !== LANG) setLanguage(data.settings.lang, true);
        if (data.settings.preset && data.settings.preset !== State.preset && PRESETS[data.settings.preset]) {
          applyPreset(data.settings.preset, true);
        }
        if (typeof data.settings.audio === 'boolean') {
          State.audio = data.settings.audio;
          AudioEngine.muted = !State.audio;
        }
      }
    } catch (e) { /* ignore corrupt journal */ }
  }

  /* ------------------------------------------------------------------ */
  /* 28. Audio controls and narration                                   */
  /* ------------------------------------------------------------------ */
  function updateAudioButton() {
    const btn = $('#btn-audio');
    if (!btn) return;
    btn.setAttribute('aria-pressed', State.audio ? 'true' : 'false');
    btn.title = State.audio ? t('audio.on') : t('audio.off');
  }

  function toggleAudio() {
    AudioEngine.init();
    AudioEngine.resume();
    State.audio = !State.audio;
    AudioEngine.setMuted(!State.audio);
    updateAudioButton();
    toast(t(State.audio ? 'toast.unmuted' : 'toast.muted'), 1600);
    saveLocalSoon();
  }

  function narrateCurrent() {
    const hs = HOTSPOT_BY_ID[inModal.id];
    if (!hs) return;
    const copy = hs[LANG] || hs.en;
    AudioEngine.init();
    AudioEngine.resume();
    const started = AudioEngine.speak(copy.narrate, LANG, {
      onStart: (hasVoice) => {
        setStatus(hasVoice ? t('modal.statusNarrating') : t('modal.statusNoVoice'));
      },
      onEnd: () => setStatus('', true),
      onError: () => setStatus(t('modal.statusNoVoice'))
    });
    if (!started) toast(t('toast.narrationUnsupported'));
  }

  /* ------------------------------------------------------------------ */
  /* 29. UI bindings                                                    */
  /* ------------------------------------------------------------------ */
  function bindUI() {
    $$('#lang-switch .seg-btn').forEach((b) => {
      b.addEventListener('click', () => setLanguage(b.dataset.lang));
    });

    $$('#preset-switch .seg-btn').forEach((b) => {
      b.addEventListener('click', () => {
        const name = b.dataset.preset;
        applyPreset(name);
        const msg = name === 'dawn' ? 'toast.presetDawn' : name === 'sunset' ? 'toast.presetSunset' : 'toast.presetNight';
        toast(t(msg), 2600);
      });
    });

    $$('#mode-switch .seg-btn').forEach((b) => {
      b.addEventListener('click', () => {
        setMode(b.dataset.mode);
        if (b.dataset.mode === 'walk' && !SHOT) requestLock();
      });
    });

    const audioBtn = $('#btn-audio');
    if (audioBtn) audioBtn.addEventListener('click', toggleAudio);

    const photoBtn = $('#btn-photo');
    if (photoBtn) photoBtn.addEventListener('click', () => capturePhoto());

    const saveBtn = $('#btn-save');
    if (saveBtn) saveBtn.addEventListener('click', exportJournal);

    const loadBtn = $('#btn-load');
    if (loadBtn) loadBtn.addEventListener('click', loadJournal);

    const hotspotsToggle = $('#btn-hotspots');
    if (hotspotsToggle) {
      hotspotsToggle.addEventListener('click', () => {
        const panel = $('#panel-left');
        const open = panel.classList.toggle('is-open');
        hotspotsToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        const mob = $('.hotspot-list');
        if (open && mob) mob.scrollTop = 0;
      });
    }

    const helpBtn = $('#btn-help');
    if (helpBtn) helpBtn.addEventListener('click', () => {
      ui.help.hidden = false;
      AudioEngine.stopSpeech();
    });
    const helpClose = $('#help-close');
    if (helpClose) helpClose.addEventListener('click', () => { ui.help.hidden = true; });
    if (ui.help) ui.help.addEventListener('click', (e) => { if (e.target === ui.help) ui.help.hidden = true; });

    const modalClose = $('#modal-close');
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (ui.modal) ui.modal.addEventListener('click', (e) => { if (e.target === ui.modal) closeModal(); });

    const narrate = $('#btn-narrate');
    if (narrate) narrate.addEventListener('click', narrateCurrent);
    const stop = $('#btn-narrate-stop');
    if (stop) stop.addEventListener('click', () => { AudioEngine.stopSpeech(); setStatus(''); });
    const bookmark = $('#btn-bookmark');
    if (bookmark) bookmark.addEventListener('click', () => capturePhoto());
    const next = $('#btn-next-hotspot');
    if (next) next.addEventListener('click', nextHotspot);

    const helpGallery = $('#help-gallery');
    if (helpGallery) helpGallery.addEventListener('click', () => {
      ui.help.hidden = true;
      ui.gallery.hidden = false;
      renderGallery();
    });
    const helpSave = $('#help-save');
    if (helpSave) helpSave.addEventListener('click', exportJournal);
    const helpLoad = $('#help-load');
    if (helpLoad) helpLoad.addEventListener('click', loadJournal);

    const galleryBtn = $('#btn-photo');
    const gallery = $('#gallery');
    const galleryClose = $('#gallery-close');
    if (galleryClose) galleryClose.addEventListener('click', () => { ui.gallery.hidden = true; });
    if (gallery) gallery.addEventListener('click', (e) => { if (e.target === ui.gallery) ui.gallery.hidden = true; });

    // long-press the photo button (or shift-click) opens the gallery
    if (galleryBtn) {
      galleryBtn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        ui.gallery.hidden = false;
        renderGallery();
      });
    }

    const begin = $('#btn-begin');
    if (begin) begin.addEventListener('click', () => startExperience('walk'));
    const beginOrbit = $('#btn-begin-orbit');
    if (beginOrbit) beginOrbit.addEventListener('click', () => startExperience('orbit'));

    // touch controls
    $$('#touch-pad button').forEach((b) => {
      const dir = b.dataset.move;
      const on = (e) => { e.preventDefault(); touchMove[dir] = 1; };
      const off = (e) => { e.preventDefault(); touchMove[dir] = 0; };
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off);
      b.addEventListener('pointerleave', off);
      b.addEventListener('pointercancel', off);
    });

    // canvas pointer lock, mouse-look fallback, hotspot clicks
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', (e) => {
      if (State.mode !== 'walk' || introVisible) return;
      if (e.button !== 0) return;
      if (!pointer.isLocked) {
        drag.on = true;
        drag.x = e.clientX;
        drag.y = e.clientY;
        drag.moved = 0;
        requestLock();
      } else if (hoverHotspot) {
        openHotspot(hoverHotspot.id);
      }
    });
    window.addEventListener('mousemove', (e) => {
      if (!drag.on) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      if (pointer.isLocked) return;
      camera.rotation.order = 'YXZ';
      camera.rotation.y -= dx * 0.0031;
      camera.rotation.x = clamp(camera.rotation.x - dy * 0.0031, -1.25, 1.25);
      player.yaw = camera.rotation.y;
      player.pitch = camera.rotation.x;
    });
    window.addEventListener('mouseup', () => { drag.on = false; });

    canvas.addEventListener('touchstart', (e) => {
      if (State.mode !== 'walk' || introVisible || e.touches.length !== 1) return;
      touchLook.id = e.touches[0].identifier;
      touchLook.x = e.touches[0].clientX;
      touchLook.y = e.touches[0].clientY;
    }, { passive: true });
    canvas.addEventListener('touchmove', (e) => {
      if (touchLook.id < 0) return;
      const tch = Array.from(e.touches).find((t) => t.identifier === touchLook.id);
      if (!tch) return;
      const dx = tch.clientX - touchLook.x;
      const dy = tch.clientY - touchLook.y;
      touchLook.x = tch.clientX;
      touchLook.y = tch.clientY;
      camera.rotation.order = 'YXZ';
      camera.rotation.y -= dx * 0.005;
      camera.rotation.x = clamp(camera.rotation.x - dy * 0.005, -1.2, 1.2);
      player.yaw = camera.rotation.y;
      player.pitch = camera.rotation.x;
    }, { passive: true });
    canvas.addEventListener('touchend', () => { touchLook.id = -1; }, { passive: true });

    canvas.addEventListener('pointerlockerror', () => {
      toast(t('toast.needLock'), 2400);
    });
    document.addEventListener('pointerlockchange', () => {
      const locked = document.pointerLockElement === canvas;
      document.body.classList.toggle('is-locked', locked);
    });

    // keyboard
    window.addEventListener('keydown', (e) => {
      if (isTypeable(e.target)) return;
      const k = (e.key || '').toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(k) !== -1) e.preventDefault();
      if (k === ' ') keys[' '] = true;
      keys[k] = true;
      if (e.repeat) return;

      if (k === 'e') interact();
      else if (k === 'm') toggleMap();
      else if (k === 'p') capturePhoto();
      else if (k === 'h') { ui.help.hidden = false; }
      else if (k === 'g') { ui.gallery.hidden = false; renderGallery(); }
      else if (k === '1') resetDrone();
      else if (k === '2' && State.mode === 'walk') { /* reserved */ }
      else if (k === 'escape') {
        if (inModal.open) closeModal();
        else if (!ui.help.hidden) ui.help.hidden = true;
        else if (!ui.gallery.hidden) ui.gallery.hidden = true;
      }
    });
    window.addEventListener('keyup', (e) => {
      const k = (e.key || '').toLowerCase();
      keys[k] = false;
      if (k === ' ') keys[' '] = false;
    });
    window.addEventListener('blur', () => {
      Object.keys(keys).forEach((k) => { keys[k] = false; });
      touchMove.fwd = touchMove.back = touchMove.left = touchMove.right = 0;
    });

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        AudioEngine.stopSpeech();
      } else {
        clock.last = nowMs();
      }
    });
  }

  function onResize() {
    const w = innerWidth;
    const h = innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const DPR_CAP = IS_TOUCH ? 1.35 : 1.75;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, DPR_CAP));
    renderer.setSize(w, h);
  }

  function startExperience(mode) {
    if (!introVisible) {
      setMode(mode);
      return;
    }
    introVisible = false;
    ui.intro.classList.add('is-hidden');
    setTimeout(() => { if (ui.intro) ui.intro.style.display = 'none'; }, 700);
    AudioEngine.init();
    AudioEngine.resume();
    const initial = mode || 'walk';
    player.y = groundHeight(player.x, player.z);
    setMode(initial, true);
    camera.fov = initial === 'walk' ? 60 : 52;
    camera.updateProjectionMatrix();
    if (initial === 'walk') {
      placeCameraOnPlayer();
      if (!SHOT) requestLock();
    } else {
      camera.position.set(132, 58, 56);
      orbit.target.set(0, 27, 0);
      orbit.update();
    }
    toast(t(initial === 'walk' ? 'toast.modeWalk' : 'toast.modeOrbit'), 3200);
    saveLocalSoon();
  }

  /* ------------------------------------------------------------------ */
  /* 30. World animation                                                */
  /* ------------------------------------------------------------------ */
  function animateWorld(dt, time) {
    if (TEX.waterNormal) {
      TEX.waterNormal.offset.x = (TEX.waterNormal.offset.x + dt * 0.012) % 1;
      TEX.waterNormal.offset.y = (TEX.waterNormal.offset.y + dt * 0.019) % 1;
    }
    skyUniforms.time.value = time;

    // hotspot markers float and breathe
    HOTSPOTS.forEach((h, i) => {
      if (!h.marker) return;
      const bob = Math.sin(time * 1.35 + h.phase) * 0.22;
      h.marker.position.y = h.pos[1] + bob;
      h.marker.rotation.y = Math.sin(time * 0.4 + i) * 0.12;
      if (h.sprite) {
        const s = 2.85 + Math.sin(time * 1.8 + h.phase) * 0.08;
        h.sprite.scale.set(s, s, 1);
        h.sprite.material.opacity = h.visited ? 0.92 : 0.98;
      }
      if (h.ring) {
        const sc = 1 + Math.sin(time * 1.5 + h.phase) * 0.08;
        h.ring.scale.setScalar(sc);
        h.ring.rotation.z = time * 0.4;
        h.ring.material.opacity = 0.32 + Math.sin(time * 1.5 + h.phase) * 0.12;
      }
      if (h.beam) h.beam.material.opacity = 0.10 + Math.sin(time * 1.1 + h.phase) * 0.04;
    });

    // boats drift on the river
    animated.boats.forEach((b, i) => {
      if (!b.group) return;
      const drift = Math.sin(time * 0.055 * b.speed + b.phase) * 22;
      b.group.position.z = b.baseZ + drift * b.dir;
      b.group.position.x = b.baseX + Math.sin(time * 0.07 + b.phase * 2) * 1.6;
      b.group.position.y = -0.42 + Math.sin(time * 0.9 + b.phase) * 0.05;
      b.group.rotation.z = Math.sin(time * 0.7 + b.phase) * 0.018;
      b.group.rotation.x = Math.sin(time * 0.55 + b.phase * 1.7) * 0.012;
    });

    clouds.forEach((c, i) => {
      c.position.x += dt * c.userData.drift * 0.6;
      if (c.position.x > 1500) c.position.x = -1500;
    });

    // lanterns flicker a little
    animated.lanterns.forEach((l, i) => {
      if (l.material) {
        l.material.emissiveIntensity = (0.25 + LIGHT_NOW.flood * 1.2) * (0.9 + Math.sin(time * 3 + i) * 0.1);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* 31. Intro camera                                                   */
  /* ------------------------------------------------------------------ */
  function updateIntroCamera(time) {
    const a = time * 0.042 + 0.34;
    camera.position.set(Math.cos(a) * 132, 48 + Math.sin(a * 0.8) * 6, Math.sin(a) * 132);
    camera.lookAt(0, 27, 0);
  }

  /* ------------------------------------------------------------------ */
  /* 32. Main loop                                                      */
  /* ------------------------------------------------------------------ */
  function animate() {
    requestAnimationFrame(animate);
    const tNow = nowMs();
    let dt = (tNow - clock.last) / 1000;
    clock.last = tNow;
    if (!(dt > 0)) dt = 0.016;
    dt = Math.min(dt, 0.05);
    clock.elapsed += dt;
    frame++;

    if (introVisible) {
      updateIntroCamera(clock.elapsed);
    } else {
      updatePlayer(dt);
      if (State.mode === 'orbit') orbit.update();
      if (frame % 8 === 0) updateNearby();
    }

    if (frame % 3 === 0) updateHoverTarget();
    updateLighting(dt);
    animateWorld(dt, clock.elapsed);
    AudioEngine.tick(dt);
    if (frame % 2 === 0) drawMinimap();

    renderer.render(scene, camera);
  }

  /* ------------------------------------------------------------------ */
  /* 33. Self test                                                      */
  /* ------------------------------------------------------------------ */
  function runSelfTest() {
    const results = [];
    const add = (name, fn) => {
      let ok = false;
      let detail = '';
      try {
        const r = fn();
        if (r && typeof r === 'object') { ok = !!r.ok; detail = r.detail || ''; }
        else { ok = !!r; }
      } catch (e) {
        ok = false;
        detail = e.message;
      }
      results.push({ name, ok, detail });
    };

    add('Three.js r128 loaded', () => !!window.THREE && THREE.REVISION === '128');
    add('WebGL renderer created', () => !!renderer && !!renderer.domElement);
    add('Scene contains the courtyard world', () => world.children.length >= 10);
    add('Central prang taller than 70 m', () => ({
      ok: !!centralPrang && centralPrang.userData.height > 70,
      detail: centralPrang ? Math.round(centralPrang.userData.height) + ' m' : 'missing'
    }));
    add('Four satellite prangs', () => buildStats.satellites === 4);
    add('Four corner mondops', () => buildStats.mondops === 4);
    add('Six riverside salas', () => buildStats.salas === 6);
    add('Two yaksha guardians', () => buildStats.yakshas === 2);
    add('Five bilingual hotspots', () => HOTSPOTS.length === 5 && HOTSPOTS.every((h) => h.en && h.th));
    add('Hotspot list rendered', () => $$('#hotspot-list .hotspot-item').length === 5);
    add('Hotspot marker sprites', () => markerSprites.length === 5);
    add('Mini-map canvas available', () => !!mmCtx);
    add('Three lighting presets', () => Object.keys(PRESETS).length === 3);
    add('Preset switch works', () => {
      applyPreset('night', true);
      const night = sunLight.intensity < 0.5;
      applyPreset('dawn', true);
      return night && sunLight.intensity > 1;
    });
    add('Floodlights wired', () => lightRig.floodlights.length >= 4 && lightRig.floodlights.every((f) => !!f.light));
    add('Sky dome + star field', () => !!skyDome && !!animated.stars);
    add('Animated river surface', () => !!animated.water && !!MAT.water.normalMap);
    add('Ground heights resolve', () => groundHeight(47, 0) === 0.7 && groundHeight(0, 0) === 1.5);
    add('Collision blocks the prang', () => {
      const p = resolveCollisions(0, 0);
      return Math.hypot(p.x, p.z) > 13;
    });
    add('Walk + drone controls', () => !!pointer && !!orbit && typeof pointer.lock === 'function');
    add('Web Audio synthesis API', () => !!AudioEngine && typeof AudioEngine.chime === 'function' && typeof AudioEngine.footstep === 'function');
    add('Journal payload + filename', () => {
      const p = journalPayload();
      return p.format === 'watarun-3d-journal' && JOURNAL_FILE === 'watarun_3d_journal.json';
    });
    add('Bilingual switch works', () => {
      setLanguage('th', true);
      const th = document.documentElement.lang === 'th' && $('#btn-narrate span').textContent === I18N.th['modal.narrate'];
      setLanguage('en', true);
      return th && document.documentElement.lang === 'en';
    });
    add('Hotspot card opens and closes', () => {
      openHotspot('prang');
      const opened = !ui.modal.hidden && ui.modalTitle.textContent.length > 5 && ui.modalBody.children.length >= 3;
      closeModal();
      return opened && ui.modal.hidden;
    });
    add('Web Audio context initialises', () => {
      const ok = AudioEngine.init();
      return ok && !!AudioEngine.ctx && !!AudioEngine.master && AudioEngine.ready;
    });
    add('Photo capture produces JPEG data', () => {
      const before = State.photos.length;
      const p = capturePhoto();
      if (p && State.photos[0] === p) State.photos.shift();
      if (State.photos.length !== before) State.photos.length = before;
      saveLocalSoon();
      return !!p && p.data.indexOf('data:image/jpeg') === 0 && p.data.length > 2000;
    });
    add('Local journal can be saved', () => {
      saveLocal();
      try { return !!localStorage.getItem(STORAGE_KEY); } catch (e) { return false; }
    });
    add('No uncaught runtime errors', () => State.errors.length === 0 || State.errors.join(' | '));

    const pass = results.filter((r) => r.ok).length;
    const list = $('#selftest-list');
    if (list) {
      list.innerHTML = '';
      results.forEach((r) => {
        const row = document.createElement('div');
        row.className = 'row ' + (r.ok ? 'pass' : 'fail');
        const a = document.createElement('span');
        a.textContent = r.name + (r.detail ? ' — ' + r.detail : '');
        const b = document.createElement('b');
        b.textContent = r.ok ? 'PASS' : 'FAIL';
        row.appendChild(a); row.appendChild(b);
        list.appendChild(row);
      });
    }
    const summary = $('#selftest-summary');
    if (summary) summary.textContent = pass + ' / ' + results.length + ' checks passed';
    window.__SELFTEST__ = { pass, total: results.length, results };
    const box = $('#selftest');
    if (box) box.hidden = false;
    return window.__SELFTEST__;
  }

  /* ------------------------------------------------------------------ */
  /* 34. Initialisation                                                 */
  /* ------------------------------------------------------------------ */
  function hideLoader() {
    if (!ui.loader) return;
    setLoader(100, 'loader.ready');
    setTimeout(() => {
      ui.loader.classList.add('is-done');
      setTimeout(() => { ui.loader.style.display = 'none'; }, 800);
    }, 420);
  }

  function init() {
    // camera & renderer defaults
    camera.rotation.order = 'YXZ';
    player.y = groundHeight(player.x, player.z);

    const paramLang = PARAMS.get('lang');
    if (paramLang === 'th' || paramLang === 'en') LANG = paramLang;

    setLoader(12, 'loader.building');
    buildWorld();
    markerSprites = HOTSPOTS.map((h) => h.sprite).filter(Boolean);
    setLoader(58, 'loader.materials');

    const paramPreset = PARAMS.get('preset');
    const initialPreset = paramPreset && PRESETS[paramPreset] ? paramPreset : 'dawn';
    applyPreset(initialPreset, true);
    setLanguage(LANG, true);

    bindUI();
    restoreLocal();

    // keep the HUD in sync with restored/journal settings
    if (State.preset !== initialPreset && PRESETS[State.preset]) applyPreset(State.preset, true);
    updateAudioButton();
    buildHotspotList();
    updateVisitedBadge();
    updateZoneLabel(true);

    setLoader(82, 'loader.gardens');
    updateEnvironment();
    setLoader(96, 'loader.ready');

    // initial camera placement
    if (SHOT) {
      introVisible = false;
      ui.intro.style.display = 'none';
      if (ui.loader) ui.loader.style.display = 'none';
      const camParam = PARAMS.get('cam');
      if (camParam === 'orbit') {
        State.mode = 'orbit';
        document.body.classList.add('orbit-mode');
        camera.position.set(132, 58, 56);
        orbit.target.set(0, 26, 0);
        orbit.enabled = true;
        orbit.update();
        setMode('orbit', true);
      } else {
        placeCameraOnPlayer();
        setMode('walk', true);
      }
      hideLoader();
    } else {
      introVisible = true;
      hideLoader();
    }

    window.__WATARUN__ = {
      version: APP_VERSION,
      scene,
      world,
      camera,
      renderer,
      groups,
      hotspots: HOTSPOTS,
      player,
      state: State,
      buildStats,
      colliders,
      get centralPrang() { return centralPrang; },
      groundHeight,
      resolveCollisions,
      applyPreset,
      setMode,
      setLanguage,
      capturePhoto,
      journal: {
        payload: journalPayload,
        export: exportJournal,
        load: loadJournal,
        apply: applyJournal,
        filename: JOURNAL_FILE
      },
      audio: AudioEngine,
      orbit,
      pointer,
      minimap: minimap
    };

    animate();

    const deepHotspot = PARAMS.get('hotspot');
    if (deepHotspot && HOTSPOT_BY_ID[deepHotspot]) {
      setTimeout(() => openHotspot(deepHotspot), 350);
    }
    if (PARAMS.get('gallery') === '1') {
      setTimeout(() => { ui.gallery.hidden = false; renderGallery(); }, 400);
    }
    if (PARAMS.get('help') === '1') {
      setTimeout(() => { ui.help.hidden = false; }, 400);
    }

    setTimeout(() => {
      setLoader(100, 'loader.ready');
      if (SELFTEST && !selftestDone) {
        selftestDone = true;
        setTimeout(runSelfTest, 250);
      }
    }, 300);

    setTimeout(() => { if (!introVisible) drawMinimap(); }, 600);
  }

  // kick off
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
