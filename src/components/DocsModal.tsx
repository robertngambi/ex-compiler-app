import React from 'react';
import { 
  X, 
  HelpCircle, 
  Smartphone, 
  Monitor, 
  Download, 
  CheckCircle2, 
  Link2
} from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                Guide: Generating Output Files in Different Formats
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          
          {/* Quick Overview */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-blue-300">
            <span className="font-bold block mb-1">How Ex-Compiler Manages Output Generation:</span>
            Ex-Compiler accepts hosted URLs or uploaded project archives (.zip, .apk, .ipa, .aab) and automatically compiles native artifacts without cross-compilation errors using native runner routing.
          </div>

          {/* Mobile Outputs Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Mobile Output Formats</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* APK */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="font-mono font-bold text-blue-600 dark:text-blue-400 mb-1">Android APK (.apk)</div>
                  <span className="text-[10px] text-slate-500 font-mono block mb-2 font-semibold">Local Testing / Sideload</span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Install directly on Android devices, emulators, or Firebase App Distribution without going through an app store.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-900 font-mono text-[10px] text-slate-500">
                  Command: ./gradlew assembleRelease
                </div>
              </div>

              {/* AAB */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="font-mono font-bold text-blue-600 dark:text-blue-400 mb-1">Android AAB (.aab)</div>
                  <span className="text-[10px] text-slate-500 font-mono block mb-2 font-semibold">Google Play Store</span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Official format required by Google Play Console. Generates dynamic split APKs optimized for each user device.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-900 font-mono text-[10px] text-slate-500">
                  Command: ./gradlew bundleRelease
                </div>
              </div>

              {/* IPA */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="font-mono font-bold text-blue-600 dark:text-blue-400 mb-1">iOS IPA (.ipa)</div>
                  <span className="text-[10px] text-slate-500 font-mono block mb-2 font-semibold">App Store & TestFlight</span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Compiled Xcode archive signed with Apple certificates for TestFlight distribution or App Store submission.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-900 font-mono text-[10px] text-slate-500">
                  Runner: MacStadium / macOS Xcode
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Outputs Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
              <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Desktop Output Formats (Native CI Matrix)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Windows EXE */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="font-mono font-bold text-blue-600 dark:text-blue-400 mb-1">Windows EXE (.exe)</div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Standalone NSIS installer for Windows 10/11. Includes uninstaller, desktop shortcut, and registry registration. Built on native <code className="font-mono text-slate-800 dark:text-slate-300">windows-latest</code> runner.
                </p>
              </div>

              {/* Windows MSI */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="font-mono font-bold text-blue-600 dark:text-blue-400 mb-1">Windows MSI (.msi)</div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Enterprise Windows Installer built with WiX Toolset. Designed for centralized network distribution via Active Directory Group Policy (GPO) and Microsoft Intune.
                </p>
              </div>

              {/* macOS DMG */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="font-mono font-bold text-blue-600 dark:text-blue-400 mb-1">macOS DMG (.dmg)</div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Apple disk image installer containing the application bundle with drag-to-Applications support. Compiled natively on <code className="font-mono text-slate-800 dark:text-slate-300">macos-14</code> runner for Apple Silicon & Intel.
                </p>
              </div>

              {/* Linux AppImage */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="font-mono font-bold text-blue-600 dark:text-blue-400 mb-1">Linux AppImage (.AppImage)</div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Self-contained universal Linux binary. Runs on Ubuntu, Debian, Fedora, Arch, and Red Hat without requiring root privileges or package manager installation.
                </p>
              </div>
            </div>
          </div>

          {/* Managing & Obtaining Artifacts */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>How to Manage & Download Generated Artifacts</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 text-[11px] text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">Individual Downloads:</strong> Click the blue <strong>Download</strong> button on any output card to download that specific file.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">Master Archive:</strong> Click <strong>Download All as ZIP</strong> at the top of the Results Panel to bundle all generated packages into a single zip with checksums and release notes.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">Permalinks & Releases:</strong> Click <strong>Copy URL</strong> on any card to copy the direct cloud storage or GitHub release asset link for deployment pipelines.
                </div>
              </div>
            </div>
          </div>

          {/* More on Permalinks & Pipelines */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
              <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>More on Permalinks & Pipelines</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3.5 text-[11px] text-slate-700 dark:text-slate-300">
              <div>
                <h5 className="font-bold text-blue-600 dark:text-blue-400 text-xs mb-1">What is a Permalink?</h5>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  A <strong>Permalink</strong> (permanent link) is an immutable, persistent web address directly tied to a specific release version, build artifact, and cryptographic SHA-256 binary hash. Unlike temporary sandbox uploads that expire after a session, permalinks remain reachable at stable URLs (such as GitHub Release assets or permanent cloud storage buckets). This allows downstream automated systems, QA testers, and package managers to reliably fetch the exact artifact without link rot.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-900">
                <h5 className="font-bold text-blue-600 dark:text-blue-400 text-xs mb-1">What is a Build Pipeline?</h5>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  A <strong>Pipeline</strong> is the automated, step-by-step orchestrator that transforms source code into validated, production-ready binary outputs. In Ex-Compiler, the pipeline coordinates source analysis &rarr; auto-dependency resolution &rarr; error auto-patching &rarr; native matrix compilation &rarr; cryptographic signing &rarr; release packaging. Instead of failing on cross-compilation quirks, Ex-Compiler's pipeline dispatches Android jobs to Docker JDK 17 containers, iOS jobs to cloud Mac hosts, and desktop jobs to native GitHub Actions matrix runners (Windows, macOS, and Linux).
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-900">
                <h5 className="font-bold text-blue-600 dark:text-blue-400 text-xs mb-1">How They Work Together (Continuous Deployment)</h5>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  When a build pipeline finishes, Ex-Compiler publishes the compiled packages, signs them with your configured keys, and registers their permanent permalinks. You can supply a <strong>Webhook URL</strong> in Developer Settings to automatically notify external deployment systems (like Google Play Publishing API, Fastlane TestFlight, Microsoft Store, or custom Slack bots) with the newly minted permalinks and checksums as soon as the build succeeds.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-all shadow-md shadow-blue-600/30 cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
