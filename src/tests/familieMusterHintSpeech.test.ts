import { describe, expect, it, vi } from 'vitest'
import {
  cancelFamilieMusterHintSpeech,
  speakFamilieMusterHintText,
} from '../utils/familieMusterHintSpeech'

describe('familieMusterHintSpeech', () => {
  it('speakFamilieMusterHintText: leer bricht nicht ab und ruft cancel/speak nicht sinnlos auf', () => {
    const cancel = vi.fn()
    const speak = vi.fn()
    const orig = window.speechSynthesis
    // @ts-expect-error Test-Mock
    window.speechSynthesis = { cancel, speak } as SpeechSynthesis
    speakFamilieMusterHintText('   ')
    expect(speak).not.toHaveBeenCalled()
    window.speechSynthesis = orig
  })

  it('cancelFamilieMusterHintSpeech: ohne API bricht nicht ab', () => {
    const orig = window.speechSynthesis
    // @ts-expect-error Test
    window.speechSynthesis = undefined
    expect(() => cancelFamilieMusterHintSpeech()).not.toThrow()
    window.speechSynthesis = orig
  })
})
