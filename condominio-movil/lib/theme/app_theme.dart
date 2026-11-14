import 'package:flutter/material.dart';

/// Paleta compartida con el panel web; las dos variantes siguen disponibles.
abstract final class AppTheme {
  static const navy = Color(0xFF06172E);
  static const panel = Color(0xFF0B203B);
  static const outline = Color(0xFF315575);
  static const sky = Color(0xFF38BDF8);
  static const blue = Color(0xFF145C88);

  static ThemeData build(Brightness brightness) {
    final dark = brightness == Brightness.dark;
    final scheme = ColorScheme.fromSeed(seedColor: blue, brightness: brightness)
        .copyWith(
          primary: dark ? sky : const Color(0xFF075C8A),
          onPrimary: dark ? navy : Colors.white,
          secondary: dark ? const Color(0xFF80D4FF) : const Color(0xFF126A99),
          surface: dark ? panel : Colors.white,
          onSurface: dark ? const Color(0xFFE7F1FF) : const Color(0xFF102B44),
          outline: dark ? outline : const Color(0xFFB9CCDC),
        );
    final surface = dark ? panel : Colors.white;
    final background = dark ? navy : const Color(0xFFF0F5F9);
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: scheme.outline),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: background,
      appBarTheme: AppBarTheme(
        backgroundColor: dark ? const Color(0xFF041225) : Colors.white,
        foregroundColor: scheme.onSurface,
        centerTitle: false,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: TextStyle(
          color: scheme.onSurface,
          fontSize: 19,
          fontWeight: FontWeight.w700,
        ),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: scheme.outline.withValues(alpha: .65)),
        ),
      ),
      drawerTheme: DrawerThemeData(backgroundColor: surface),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: dark ? const Color(0xFF0B203B) : Colors.white,
        indicatorColor: dark
            ? const Color(0xFF174F73)
            : const Color(0xFFCDEBFA),
        elevation: 0,
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: surface,
        surfaceTintColor: Colors.transparent,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
      ),
      dividerTheme: DividerThemeData(
        color: scheme.outline.withValues(alpha: .55),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: dark ? const Color(0xFF071A31) : const Color(0xFFF7FAFC),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
        border: border,
        enabledBorder: border,
        focusedBorder: border.copyWith(
          borderSide: BorderSide(color: scheme.primary, width: 2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: blue,
          foregroundColor: Colors.white,
          minimumSize: const Size(0, 48),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      listTileTheme: ListTileThemeData(
        iconColor: scheme.primary,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 3),
      ),
    );
  }
}
