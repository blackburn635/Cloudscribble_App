7// ios/CloudScribble/Colors.swift
import UIKit

extension UIColor {
    
    // MARK: - Primary Brand Colors
    static let navy = UIColor(red: 40/255, green: 53/255, blue: 147/255, alpha: 1.0)
    static let mauve = UIColor(red: 185/255, green: 149/255, blue: 169/255, alpha: 1.0)
    static let cream = UIColor(red: 253/255, green: 248/255, blue: 240/255, alpha: 1.0)
    static let creamAlt = UIColor(red: 252/255, green: 248/255, blue: 241/255, alpha: 1.0)
    
    // MARK: - Secondary Brand Colors
    static let gold = UIColor(red: 200/255, green: 169/255, blue: 67/255, alpha: 1.0)
    static let goldAlt = UIColor(red: 212/255, green: 175/255, blue: 55/255, alpha: 1.0)
    static let sage = UIColor(red: 156/255, green: 175/255, blue: 136/255, alpha: 1.0)
    static let dustyRose = UIColor(red: 232/255, green: 180/255, blue: 188/255, alpha: 1.0)
    static let lavender = UIColor(red: 230/255, green: 230/255, blue: 250/255, alpha: 1.0)
    
    // MARK: - Accent & Supporting Colors
    static let softPeach = UIColor(red: 255/255, green: 223/255, blue: 211/255, alpha: 1.0)
    static let lightBlue = UIColor(red: 120/255, green: 203/255, blue: 249/255, alpha: 1.0)
    static let lightPurple = UIColor(red: 103/255, green: 116/255, blue: 200/255, alpha: 1.0)
    static let warmGray = UIColor(red: 74/255, green: 75/255, blue: 79/255, alpha: 1.0)
    
    // MARK: - Color Variations
    static let mauveLight = UIColor(red: 197/255, green: 167/255, blue: 184/255, alpha: 1.0)
    static let roseLight = UIColor(red: 242/255, green: 196/255, blue: 203/255, alpha: 1.0)
    static let sageLight = UIColor(red: 181/255, green: 199/255, blue: 164/255, alpha: 1.0)
    static let goldLight = UIColor(red: 212/255, green: 188/255, blue: 108/255, alpha: 1.0)
    static let navyLight = UIColor(red: 57/255, green: 73/255, blue: 171/255, alpha: 1.0)
    static let navyDark = UIColor(red: 42/255, green: 53/255, blue: 128/255, alpha: 1.0)
    
    // MARK: - Functional Colors
    static let brandBlue = UIColor(red: 3/255, green: 169/255, blue: 244/255, alpha: 1.0)
    static let brandAccent1 = UIColor(red: 103/255, green: 116/255, blue: 200/255, alpha: 1.0)
    static let brandAccent2 = UIColor(red: 88/255, green: 101/255, blue: 191/255, alpha: 1.0)
    static let brandBackground = UIColor(red: 252/255, green: 252/255, blue: 252/255, alpha: 1.0)
    static let paleGold = UIColor(red: 230/255, green: 213/255, blue: 172/255, alpha: 1.0)
    
    // MARK: - Admin Interface Colors
    static let adminPrimary = UIColor(red: 57/255, green: 71/255, blue: 172/255, alpha: 1.0)
    static let adminSecondary = UIColor(red: 200/255, green: 169/255, blue: 67/255, alpha: 1.0)
    static let adminInfo = UIColor(red: 120/255, green: 203/255, blue: 249/255, alpha: 1.0)
    static let adminText = UIColor(red: 44/255, green: 62/255, blue: 80/255, alpha: 1.0)
    static let adminSecondaryText = UIColor(red: 90/255, green: 108/255, blue: 125/255, alpha: 1.0)
    
    // MARK: - Transparent Overlays
    static let mauveOverlay = UIColor(red: 185/255, green: 149/255, blue: 169/255, alpha: 0.15)
    static let roseOverlay = UIColor(red: 232/255, green: 180/255, blue: 188/255, alpha: 0.15)
    static let sageOverlay = UIColor(red: 156/255, green: 175/255, blue: 136/255, alpha: 0.15)
    static let navyOverlay = UIColor(red: 40/255, green: 53/255, blue: 147/255, alpha: 0.8)
    static let darkOverlay = UIColor(red: 0/255, green: 0/255, blue: 0/255, alpha: 0.5)
    
    // MARK: - Convenience Methods
    
    /// Primary button color with automatic state handling
    static func primaryButton(for state: UIControl.State) -> UIColor {
        switch state {
        case .highlighted:
            return .navyDark
        case .disabled:
            return .warmGray
        default:
            return .navy
        }
    }
    
    /// Secondary button color with automatic state handling
    static func secondaryButton(for state: UIControl.State) -> UIColor {
        switch state {
        case .highlighted:
            return .mauveLight
        case .disabled:
            return .warmGray
        default:
            return .mauve
        }
    }
    
    /// Success state color
    static let success = sage
    
    /// Warning state color
    static let warning = gold
    
    /// Info state color
    static let info = lightBlue
    
    /// Error state color
    static let error = dustyRose
}

// MARK: - Color Scheme Support
extension UIColor {
    
    /// Returns appropriate color for current interface style (light/dark mode)
    static func adaptive(light: UIColor, dark: UIColor) -> UIColor {
        return UIColor { traitCollection in
            switch traitCollection.userInterfaceStyle {
            case .dark:
                return dark
            default:
                return light
            }
        }
    }
    
    /// Primary background color that adapts to interface style
    static let adaptiveBackground = adaptive(light: .creamAlt, dark: .navy)
    
    /// Primary text color that adapts to interface style
    static let adaptiveText = adaptive(light: .navy, dark: .cream)
    
    /// Secondary text color that adapts to interface style
    static let adaptiveSecondaryText = adaptive(light: .warmGray, dark: .mauveLight)
}

// MARK: - CloudScribble Brand Colors Struct
struct CloudScribbleColors {
    
    // Navigation colors
    static let navigationBackground = UIColor.creamAlt
    static let navigationPrimary = UIColor.navy
    static let navigationActive = UIColor.mauve
    
    // Button colors
    static let buttonPrimary = UIColor.lightPurple
    static let buttonSecondary = UIColor.mauve
    static let buttonSuccess = UIColor.sage
    static let buttonPremium = UIColor.gold
    
    // Background colors
    static let backgroundMain = UIColor.creamAlt
    static let backgroundCard = UIColor.brandBackground
    static let backgroundSection = UIColor.lavender
    
    // Status colors
    static let statusSuccess = UIColor.sage
    static let statusWarning = UIColor.gold
    static let statusInfo = UIColor.lightBlue
    static let statusError = UIColor.dustyRose
}