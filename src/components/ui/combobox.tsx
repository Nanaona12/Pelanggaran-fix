import * as React from 'react';
import { Command, CommandInput, CommandItem, CommandList } from './command'; // ganti sesuai struktur
import { Popover, PopoverContent, PopoverTrigger } from './popover'; // ganti sesuai struktur

interface ComboboxProps {
  options: string[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onSelect,
  placeholder = 'Pilih...',
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-full border px-3 py-2 rounded-md cursor-pointer bg-white">
          {value || <span className="text-gray-400">{placeholder}</span>}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Cari siswa..." />
          <CommandList>
            {options.map((option) => (
              <CommandItem
                key={option}
                onSelect={() => {
                  onSelect(option);
                  setOpen(false);
                }}
              >
                {option}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
