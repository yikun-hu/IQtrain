import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

const Game2048: React.FC = () => {
    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="text-center">2048 Game</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full overflow-hidden rounded-md">
                    <iframe
                        src="/games/2048/index.html"
                        width="100%"
                        height="800px"
                        frameBorder="0"
                        title="2048 Game"
                        className="w-full"
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default Game2048;