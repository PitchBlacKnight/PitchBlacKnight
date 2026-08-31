// On-device transcription. Nothing leaves this machine.
// Usage: transcribe <audiofile> [outfile.txt]
import Foundation
import Speech
import AVFoundation

@main
struct Transcribe {
    static func main() async {
        let args = CommandLine.arguments
        guard args.count > 1 else {
            FileHandle.standardError.write("usage: transcribe <audio> [out.txt]\n".data(using: .utf8)!)
            exit(2)
        }
        let inURL = URL(fileURLWithPath: args[1])
        let outPath = args.count > 2 ? args[2] : nil

        do {
            let locale = Locale(identifier: "en-US")
            let transcriber = SpeechTranscriber(
                locale: locale,
                transcriptionOptions: [],
                reportingOptions: [],
                attributeOptions: [.audioTimeRange]
            )

            if let req = try await AssetInventory.assetInstallationRequest(supporting: [transcriber]) {
                FileHandle.standardError.write("installing on-device model...\n".data(using: .utf8)!)
                try await req.downloadAndInstall()
            }

            let analyzer = SpeechAnalyzer(modules: [transcriber])
            let file = try AVAudioFile(forReading: inURL)

            var lines: [String] = []
            let collector = Task {
                for try await result in transcriber.results {
                    if result.isFinal {
                        lines.append(String(result.text.characters))
                    }
                }
            }

            if let last = try await analyzer.analyzeSequence(from: file) {
                try await analyzer.finalizeAndFinish(through: last)
            } else {
                try await analyzer.finalizeAndFinishThroughEndOfInput()
            }
            _ = try? await collector.value

            let text = lines.joined(separator: " ")
            if let outPath = outPath {
                try text.write(toFile: outPath, atomically: true, encoding: .utf8)
                FileHandle.standardError.write("wrote \(outPath)\n".data(using: .utf8)!)
            } else {
                print(text)
            }
        } catch {
            FileHandle.standardError.write("error: \(error)\n".data(using: .utf8)!)
            exit(1)
        }
    }
}
