// android/app/src/main/java/com/cloudscribble/CloudScribbleColors.kt
package com.cloudscribble

import android.content.Context
import androidx.core.content.ContextCompat
import androidx.annotation.ColorRes

/**
 * CloudScribble Brand Colors
 * Provides easy access to brand colors throughout the app
 */
object CloudScribbleColors {
    
    /**
     * Get color resource by ID
     */
    fun getColor(context: Context, @ColorRes colorRes: Int): Int {
        return ContextCompat.getColor(context, colorRes)
    }
    
    /**
     * Primary Brand Colors
     */
    object Primary {
        fun navy(context: Context) = getColor(context, R.color.navy)
        fun mauve(context: Context) = getColor(context, R.color.mauve)
        fun cream(context: Context) = getColor(context, R.color.cream)
        fun creamAlt(context: Context) = getColor(context, R.color.cream_alt)
    }
    
    /**
     * Secondary Brand Colors
     */
    object Secondary {
        fun gold(context: Context) = getColor(context, R.color.gold)
        fun goldAlt(context: Context) = getColor(context, R.color.gold_alt)
        fun sage(context: Context) = getColor(context, R.color.sage)
        fun dustyRose(context: Context) = getColor(context, R.color.dusty_rose)
        fun lavender(context: Context) = getColor(context, R.color.lavender)
    }
    
    /**
     * Accent & Supporting Colors
     */
    object Accent {
        fun softPeach(context: Context) = getColor(context, R.color.soft_peach)
        fun lightBlue(context: Context) = getColor(context, R.color.light_blue)
        fun lightPurple(context: Context) = getColor(context, R.color.light_purple)
        fun warmGray(context: Context) = getColor(context, R.color.warm_gray)
    }
    
    /**
     * Color Variations
     */
    object Variations {
        fun mauveLight(context: Context) = getColor(context, R.color.mauve_light)
        fun roseLight(context: Context) = getColor(context, R.color.rose_light)
        fun sageLight(context: Context) = getColor(context, R.color.sage_light)
        fun goldLight(context: Context) = getColor(context, R.color.gold_light)
        fun navyLight(context: Context) = getColor(context, R.color.navy_light)
        fun navyDark(context: Context) = getColor(context, R.color.navy_dark)
    }
    
    /**
     * Functional Colors
     */
    object Functional {
        fun brandBlue(context: Context) = getColor(context, R.color.brand_blue)
        fun brandAccent1(context: Context) = getColor(context, R.color.brand_accent1)
        fun brandAccent2(context: Context) = getColor(context, R.color.brand_accent2)
        fun brandBackground(context: Context) = getColor(context, R.color.brand_background)
        fun paleGold(context: Context) = getColor(context, R.color.pale_gold)
    }
    
    /**
     * Navigation Colors
     */
    object Navigation {
        fun background(context: Context) = getColor(context, R.color.navigation_background)
        fun primary(context: Context) = getColor(context, R.color.navigation_primary)
        fun active(context: Context) = getColor(context, R.color.navigation_active)
    }
    
    /**
     * Button Colors
     */
    object Button {
        fun primary(context: Context) = getColor(context, R.color.button_primary)
        fun primaryPressed(context: Context) = getColor(context, R.color.button_primary_pressed)
        fun secondary(context: Context) = getColor(context, R.color.button_secondary)
        fun secondaryPressed(context: Context) = getColor(context, R.color.button_secondary_pressed)
        fun success(context: Context) = getColor(context, R.color.button_success)
        fun premium(context: Context) = getColor(context, R.color.button_premium)
    }
    
    /**
     * Background Colors
     */
    object Background {
        fun main(context: Context) = getColor(context, R.color.background_main)
        fun card(context: Context) = getColor(context, R.color.background_card)
        fun section(context: Context) = getColor(context, R.color.background_section)
    }
    
    /**
     * Status Colors
     */
    object Status {
        fun success(context: Context) = getColor(context, R.color.status_success)
        fun warning(context: Context) = getColor(context, R.color.status_warning)
        fun info(context: Context) = getColor(context, R.color.status_info)
        fun error(context: Context) = getColor(context, R.color.status_error)
    }
    
    /**
     * Text Colors
     */
    object Text {
        fun primary(context: Context) = getColor(context, R.color.text_primary)
        fun secondary(context: Context) = getColor(context, R.color.text_secondary)
        fun onPrimary(context: Context) = getColor(context, R.color.text_on_primary)
        fun onSecondary(context: Context) = getColor(context, R.color.text_on_secondary)
    }
    
    /**
     * Overlay Colors
     */
    object Overlay {
        fun mauve(context: Context) = getColor(context, R.color.mauve_overlay)
        fun rose(context: Context) = getColor(context, R.color.rose_overlay)
        fun sage(context: Context) = getColor(context, R.color.sage_overlay)
        fun navy(context: Context) = getColor(context, R.color.navy_overlay)
        fun dark(context: Context) = getColor(context, R.color.dark_overlay)
    }
    
    /**
     * Admin Interface Colors (if needed in mobile app)
     */
    object Admin {
        fun primary(context: Context) = getColor(context, R.color.admin_primary)
        fun secondary(context: Context) = getColor(context, R.color.admin_secondary)
        fun info(context: Context) = getColor(context, R.color.admin_info)
        fun text(context: Context) = getColor(context, R.color.admin_text)
        fun secondaryText(context: Context) = getColor(context, R.color.admin_secondary_text)
    }
}

/**
 * Extension functions for easier color access
 */
fun Context.getCloudScribbleColor(@ColorRes colorRes: Int): Int {
    return CloudScribbleColors.getColor(this, colorRes)
}

/**
 * Usage Examples:
 * 
 * // In Activity or Fragment:
 * val primaryColor = CloudScribbleColors.Primary.navy(this)
 * 
 * // In ViewHolder or Custom View:
 * val buttonColor = CloudScribbleColors.Button.primary(context)
 * 
 * // Using extension function:
 * val backgroundColor = context.getCloudScribbleColor(R.color.background_main)
 * 
 * // Setting button background programmatically:
 * button.setBackgroundColor(CloudScribbleColors.Button.primary(this))
 * 
 * // Setting text color:
 * textView.setTextColor(CloudScribbleColors.Text.primary(this))
 */