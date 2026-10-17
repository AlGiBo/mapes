import React from 'react';
import { X, BookOpen, Check, Layers, Terminal } from 'lucide-react';
import { sound } from '../utils/audio';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-stone-900">
              Com funciona el Joc i Pautes Didàctiques
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-sm text-stone-600 pt-4 leading-relaxed">
          {/* Modes de joc */}
          <div>
            <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider mb-2">
              Modes de Joc Disponibles
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Tria entre 4 opcions:</strong> Apareix un punt vermell intermitent al mapa i has de triar la resposta correcta entre les 4 opcions proposades.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Col·loca al mapa:</strong> Se't demana ubicar un element concret (ex: <em>Pedraforca</em>) i has de clicar directament sobre el punt corresponent del mapa de Catalunya.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Mode Estudi:</strong> Explora lliurement tots els accidents geogràfics, fes clic a qualsevol element per veure la seva fitxa i dades clau.
                </span>
              </li>
            </ul>
          </div>

          {/* Regles de la fitxa escolar */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
            <h3 className="font-bold text-amber-950 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-700" />
              Pautes de la fitxa escolar (com a la imatge)
            </h3>
            <ul className="space-y-1 text-xs text-amber-900">
              <li>• <strong>Serralades:</strong> majúscula i color negre (ex: PIRINEU, S. PRELITORAL).</li>
              <li>• <strong>Muntanyes / Pics:</strong> primera lletra en majúscula i la resta en minúscula (color negre).</li>
              <li>• <strong>Deltes i Caps:</strong> primera lletra en majúscula i la resta en minúscula (color negre).</li>
              <li>• <strong>Golfs:</strong> primera lletra en majúscula i la resta en minúscula (color blau).</li>
              <li>• <strong>Rius i llacs:</strong> primera lletra en majúscula i la resta en minúscula (color blau).</li>
              <li>• <strong>Mar Mediterrània:</strong> majúscula i color blau.</li>
            </ul>
          </div>

          {/* Execució en Docker amb Nginx */}
          <div className="bg-stone-900 text-stone-200 rounded-2xl p-4">
            <h3 className="font-bold text-stone-100 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Execució en Docker amb Nginx (instruccions per al servidor)
            </h3>
            <p className="text-xs text-stone-300 mb-2">
              L'aplicació inclou el seu propi <code>Dockerfile</code> i <code>nginx.conf</code> llestos per compilar i desplegar:
            </p>
            <div className="bg-black/60 p-2.5 rounded-xl font-mono text-xs text-emerald-400 select-all space-y-1">
              <div># Compilar la imatge Docker:</div>
              <div>docker build -t relleu-catalunya .</div>
              <div className="pt-1"># Executar el contenidor amb Nginx al port 80 (o 8080):</div>
              <div>docker run -d -p 8080:80 --name catalunya-joc relleu-catalunya</div>
            </div>
            <p className="text-[11px] text-stone-400 mt-2">
              També pots utilitzar <code>docker compose up -d</code> gràcies al fitxer <code>docker-compose.yml</code> inclòs.
            </p>
          </div>
        </div>

        <div className="pt-5 mt-5 border-t border-stone-100 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-stone-900 text-white font-semibold rounded-xl text-xs sm:text-sm hover:bg-stone-800 transition-colors"
          >
            Entesos, anar a jugar
          </button>
        </div>
      </div>
    </div>
  );
};
