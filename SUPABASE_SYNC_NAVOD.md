# Soukromý sync přes Supabase

Toto je volitelný cloudový sync pro jednu uživatelku. Appka funguje i bez něj.

## Co je chráněné

- Celá databáze appky se před odesláním šifruje v prohlížeči přes AES-GCM.
- Supabase nevidí zákazníky, objednávky ani poznámky v čitelné podobě.
- Fotky nejsou šifrované, ale jsou v privátním Storage bucketu.
- Bez šifrovacího hesla nejde data z cloudu obnovit.

## Nastavení Supabase

1. Vytvoř nový Supabase projekt.
2. V Supabase SQL editoru spusť soubor `supabase-schema.sql`.
3. V appce otevři `Nástroje` → `Soukromý sync`.
4. Vlož `Supabase URL` a `anon key`.
5. Vytvoř účet nebo se přihlas.
6. Zadej šifrovací heslo a klikni `Odeslat do cloudu`.
7. Pokud chceš sync bez ručního klikání, zapni `Automaticky syncovat po změnách`.

## Použití na druhém zařízení

1. Otevři stejnou appku.
2. Zadej stejnou Supabase URL, anon key, email a heslo.
3. Zadej stejné šifrovací heslo.
4. Klikni `Stáhnout z cloudu`.

## Důležité

- Šifrovací heslo si musí bezpečně uložit. Bez něj nejdou cloudová data rozšifrovat.
- Šifrovací heslo se neukládá natrvalo. Po novém otevření appky ho zadá jednou a automatický sync pak poběží během aktuální práce.
- Fotky jsou v cloudu privátní, ale nejsou šifrované.
- Před prvním větším syncem je dobré stáhnout ruční zálohu.
