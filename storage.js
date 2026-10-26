'use strict';
(function (root) {
  let database = null;
  let fallback = false;
  let backupDay = '';
  const KEY = 'htv2';

  function transaction(action) {
    return new Promise((resolve, reject) => {
      const tx = database.transaction('progress', 'readwrite');
      const store = tx.objectStore('progress');
      tx.oncomplete = resolve;
      tx.onerror = tx.onabort = () => reject(tx.error || new Error('Progress transaction failed'));
      try { action(store); } catch (error) { tx.abort(); reject(error); }
    });
  }

  const ProgressStore = {
    async load(legacy) {
      try {
        database = await new Promise((resolve, reject) => {
          const request = indexedDB.open('hoc-tu-vung', 1);
          request.onupgradeneeded = () => request.result.createObjectStore('progress');
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
          request.onblocked = () => reject(new Error('Storage is blocked by another tab'));
        });
      } catch (error) {
        fallback = true;
        return legacy;
      }
      database.onversionchange = () => database.close();
      const saved = await new Promise((resolve, reject) => {
        const request = database.transaction('progress').objectStore('progress').get('current');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      if (saved) return saved;
      await transaction(store => store.put(legacy, 'current'));
      return legacy;
    },

    save(state) {
      if (fallback) {
        try { localStorage.setItem(KEY, JSON.stringify(state)); return Promise.resolve(); }
        catch (error) { return Promise.reject(error); }
      }
      if (!database) return Promise.reject(new Error('Progress storage is not ready'));
      const day = new Date().toLocaleDateString('sv');
      const needsBackup = backupDay !== day;
      // put() snapshots state before returning; completion confirms the whole transaction committed.
      return transaction(store => {
        store.put(state, 'current');
        if (needsBackup) store.put(state, 'daily-backup');
      }).then(() => { if (needsBackup) backupDay = day; });
    },

    backup(state) {
      if (fallback) {
        try { localStorage.setItem(KEY + '-preimport', JSON.stringify(state)); return Promise.resolve(); }
        catch (error) { return Promise.reject(error); }
      }
      return transaction(store => store.put(state, 'preimport'));
    },

    get mode() { return fallback ? 'localStorage' : 'IndexedDB'; }
  };
  root.ProgressStore = ProgressStore;
})(globalThis);
