import java.util.Base64

plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
    id("com.google.gms.google-services") apply false
}

// Flutter passes --dart-define values as base64-encoded Gradle properties.
val defineValues = (project.findProperty("dart-defines") as String?)
    ?.split(",")
    ?.map { String(Base64.getDecoder().decode(it), Charsets.UTF_8) }
    ?: emptyList()
val isolationFlags = defineValues.filter { it.startsWith("CONDOMINIO_AISLADO=") }
require(isolationFlags.size <= 1 && isolationFlags.all {
    it == "CONDOMINIO_AISLADO=true" || it == "CONDOMINIO_AISLADO=false"
}) { "CONDOMINIO_AISLADO debe ser true o false y no debe repetirse." }
val isolatedBuild = isolationFlags.singleOrNull() == "CONDOMINIO_AISLADO=true"
if (isolatedBuild) {
    require(gradle.startParameter.taskNames.none {
        it.contains("release", ignoreCase = true) || it.contains("profile", ignoreCase = true)
    }) { "La variante aislada solo admite compilaciones debug." }
    gradle.taskGraph.whenReady {
        require(allTasks.none {
            it.project.path == ":app" &&
                (it.name.contains("release", ignoreCase = true) || it.name.contains("profile", ignoreCase = true))
        }) { "La variante aislada solo admite compilaciones debug." }
    }
} else {
    apply(plugin = "com.google.gms.google-services")
}

android {
    namespace = "com.condominiun.smart"
    compileSdk = 36
    ndkVersion = "27.0.12077973"

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
        isCoreLibraryDesugaringEnabled = true
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_11.toString()
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.condominiun.smart"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildTypes {
        getByName("debug") {
            if (isolatedBuild) applicationIdSuffix = ".prueba"
        }
        release {
            // TODO: Add your own signing config for the release build.
            // Signing with the debug keys for now, so `flutter run --release` works.
            signingConfig = signingConfigs.getByName("debug")
           isMinifyEnabled = false
            isShrinkResources = false
        }
    }

    if (isolatedBuild) {
        sourceSets.getByName("debug").manifest.srcFile("src/aislado/AndroidManifest.xml")
    }

}

dependencies {
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.0.4")
}

flutter {
    source = "../.."
}
