// Serializable play state; timers and audio belong to the mounted view.
export function newConnect(train, first = false) {
  return { trainId: train.id, phase: 'build', index: first && train.id !== 'komachi' ? [...train.name].length - 1 : 0,
    guided: first, help: 0, credited: false, joined: false, completedCards: [] };
}

export function connectChoices(train, state) {
  const letters = [...train.name], target = letters[state.index];
  if (state.guided || state.help >= 2 || state.index === letters.length - 1) return [target];
  // Keep the tray stable within a step, with only letters from this train's name.
  const others = [...new Set(letters.slice(state.index + 1))].filter(c => c !== target);
  const options = [target, ...others.slice(0, 2)];
  return state.index % 2 ? options.reverse() : options;
}

export function connectLetter(train, state, letter) {
  if (state.phase !== 'build') return false;
  if (letter !== [...train.name][state.index]) {
    state.help = Math.min(2, state.help + 1);
    state.joined = false;
    return false;
  }
  state.index++; state.help = 0; state.joined = true;
  if (state.index === [...train.name].length) state.phase = 'ready';
  return true;
}

export function readGarage(storage, trains) {
  try {
    const value = JSON.parse(storage?.getItem('train-connect-garage-v1'));
    return [...new Set(Array.isArray(value) ? value : [])].filter(id => trains.some(t => t.id === id));
  } catch { return []; }
}
