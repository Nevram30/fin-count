import { Info } from "lucide-react";
import React from "react";

type NoteOneFeatureProps = {
    description: string;
};

export const NoteOneFeature: React.FC<NoteOneFeatureProps> = ({
    description,
}) => {
    return (
        <>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 w-full">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Info size={20} />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-black-800">{description}</p>
                    </div>
                </div>
            </div>
        </>
    );
};
